import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { checkDualRoleStatus } from '@/lib/auth';
import Link from 'next/link';
import { User, Shield } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile and dual-role status
  const [{ data: userProfile }, dualRoleStatus] = await Promise.all([
    supabase.from('users').select('full_name, role').eq('id', user.id).single(),
    checkDualRoleStatus(user.id, supabase),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
        {dualRoleStatus.isDualRole && (
          <div className="mt-3 flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wine-light text-wine-dark">
              Host
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sunburst-100 text-sunburst-800">
              Member
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Info Section - All Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-wine-light rounded-lg">
              <User className="w-5 h-5 text-wine" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Personal Info</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Update your name, email, and other personal information.
          </p>
          <Link
            href="/dashboard/settings/personal-info"
            className="text-wine hover:text-wine-dark font-medium text-sm"
          >
            Edit Personal Info →
          </Link>
        </div>

        {/* Account Settings Section - All Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-wine-light rounded-lg">
              <Shield className="w-5 h-5 text-wine" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Manage your account security, password, and notification preferences.
          </p>
          <Link
            href="/dashboard/settings/account"
            className="text-wine hover:text-wine-dark font-medium text-sm"
          >
            Manage Account →
          </Link>
        </div>
      </div>
    </div>
  );
}
