import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PaymentCard from '@/components/dashboard/PaymentCard';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has payment method
  const { data: hostData } = await supabase
    .from('hosts')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  const hasPaymentMethod = !!hostData?.stripe_customer_id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Info</h2>
          <p className="text-sm text-gray-600 mb-6">
            Update your name, email, and other personal information.
          </p>
          <Link
            href="/dashboard/member/settings/personal-info"
            className="text-wine hover:text-wine-dark font-medium text-sm"
          >
            Edit Personal Info →
          </Link>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Manage your account security, password, and notification preferences.
          </p>
          <button className="text-wine hover:text-wine-dark font-medium text-sm">
            Manage Account →
          </button>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            {!hasPaymentMethod && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Missing Input
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-6">
            {hasPaymentMethod
              ? 'You have a payment method on file.'
              : 'Add a payment method to complete your transactions.'}
          </p>
          <button className="text-wine hover:text-wine-dark font-medium text-sm">
            {hasPaymentMethod ? 'Update Payment' : 'Add Payment Method'} →
          </button>
        </div>
      </div>
    </div>
  );
}
