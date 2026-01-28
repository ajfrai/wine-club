import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PasswordResetForm } from '@/components/settings/PasswordResetForm';

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and password.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <PasswordResetForm />
      </div>
    </div>
  );
}
