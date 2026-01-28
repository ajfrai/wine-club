import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PersonalInfoWrapper } from '@/components/settings/PersonalInfoWrapper';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PersonalInfoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-wine hover:text-wine-dark font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-600 mt-2">
          Update your name, contact information, and address.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl">
        <PersonalInfoWrapper />
      </div>
    </div>
  );
}
