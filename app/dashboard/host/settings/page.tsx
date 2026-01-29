import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PaymentHandlesForm } from '@/components/settings/PaymentHandlesForm';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';

export default async function HostSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify user is a host
  const { data: hostData } = await supabase
    .from('hosts')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!hostData) {
    redirect('/dashboard/member');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/host"
          className="flex items-center gap-2 text-wine hover:text-wine-dark transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Host Settings</h1>
        <p className="text-gray-600 mt-2">Configure how members can pay you.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <PaymentHandlesForm />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-wine-600" />
          <h2 className="text-lg font-semibold text-gray-900">Other Settings</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Manage your account settings, personal information, and preferences.
        </p>
        <Link
          href="/dashboard/settings"
          className="text-wine hover:text-wine-dark font-medium text-sm"
        >
          Go to Account Settings →
        </Link>
      </div>
    </div>
  );
}
