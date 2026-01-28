import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PasswordResetForm } from '@/components/settings/PasswordResetForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-wine hover:text-wine-dark font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and password.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <PasswordResetForm />
      </div>
    </div>
  );
}
