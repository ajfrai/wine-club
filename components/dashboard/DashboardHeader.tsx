'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wine, Settings, LogOut, ArrowRightLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  isDualRole?: boolean;
  currentDashboard: 'host' | 'member';
}

export default function DashboardHeader({ userName, userRole, isDualRole = false, currentDashboard }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Persist current dashboard preference for dual-role users
  useEffect(() => {
    if (isDualRole) {
      localStorage.setItem('lastDashboard', currentDashboard);
    }
  }, [currentDashboard, isDualRole]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-wine-light sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <Link href={`/dashboard/${currentDashboard}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Wine className="w-7 h-7 text-wine" />
            <span className="text-xl font-semibold text-wine-dark">Wine Club</span>
          </Link>

          {/* Right side - Gear icon with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 rounded-full hover:bg-wine-light transition-colors focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2"
              aria-label="Settings menu"
              aria-expanded={isDropdownOpen}
            >
              <Settings className="w-6 h-6 text-wine-dark" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-wine-light py-1 z-20">
                <Link
                  href={`/dashboard/${currentDashboard}/settings`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-wine-dark hover:bg-wine-light transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                {isDualRole && (
                  <Link
                    href={`/dashboard/${currentDashboard === 'host' ? 'member' : 'host'}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-wine-dark hover:bg-wine-light transition-colors border-t border-wine-light"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span className="flex flex-col">
                      <span>Switch to {currentDashboard === 'host' ? 'Member' : 'Host'}</span>
                      <span className="text-xs text-gray-500">Currently: {currentDashboard === 'host' ? 'Host' : 'Member'}</span>
                    </span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-wine-dark hover:bg-wine-light transition-colors border-t border-wine-light"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
