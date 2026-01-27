'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wine, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
  hasPaymentMethod?: boolean;
}

export default function DashboardHeader({ userName, userRole, hasPaymentMethod = true }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowTooltip(false);
      }
    }

    if (isDropdownOpen || showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, showTooltip]);

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
    }

    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [showTooltip]);

  const handleSettingsClick = () => {
    if (!hasPaymentMethod && !showTooltip) {
      // On mobile/first tap, show tooltip if payment is missing
      setShowTooltip(true);
      return;
    }
    setIsDropdownOpen(!isDropdownOpen);
    setShowTooltip(false);
  };

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
          <Link href="/dashboard/member" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Wine className="w-7 h-7 text-wine" />
            <span className="text-xl font-semibold text-wine-dark">Wine Club</span>
          </Link>

          {/* Right side - Gear icon with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleSettingsClick}
              className="relative p-2 rounded-full hover:bg-wine-light transition-colors focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2"
              aria-label="Settings menu"
              aria-expanded={isDropdownOpen}
              aria-describedby={showTooltip ? "payment-tooltip" : undefined}
              title={!hasPaymentMethod ? "Payment method needed" : "Settings"}
            >
              <Settings className="w-6 h-6 text-wine-dark" />
              {!hasPaymentMethod && (
                <div
                  className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"
                  role="status"
                  aria-label="Payment method required"
                />
              )}
            </button>

            {/* Payment tooltip */}
            {showTooltip && !hasPaymentMethod && (
              <div
                id="payment-tooltip"
                className="absolute right-0 mt-2 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap z-20"
                role="tooltip"
              >
                Add a payment method to complete your account setup
                <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900" />
              </div>
            )}

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-wine-light py-1 z-20">
                <Link
                  href="/dashboard/member/settings"
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-wine-dark hover:bg-wine-light transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                  {!hasPaymentMethod && (
                    <span className="inline-flex w-2 h-2 bg-red-500 rounded-full" aria-label="Payment required" />
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-wine-dark hover:bg-wine-light transition-colors"
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
