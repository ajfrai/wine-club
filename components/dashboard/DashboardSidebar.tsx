'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users, Calendar, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/member', icon: Home },
  { name: 'Profile', href: '/dashboard/member/profile', icon: User },
  { name: 'Clubs', href: '/dashboard/member/clubs', icon: Users },
  { name: 'Events', href: '/dashboard/member/events', icon: Calendar },
  { name: 'Settings', href: '/dashboard/member/settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
