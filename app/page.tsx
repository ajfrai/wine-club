'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // User is already logged in, fetch their role and redirect
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role === 'host') {
          router.replace('/dashboard/host');
        } else {
          router.replace('/dashboard/member');
        }
      } else {
        // User is not logged in, show the landing page
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light flex items-center justify-center">
        <div className="text-wine-dark">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-sunburst-50 to-wine-light">
        <div className="text-center max-w-3xl">
          <Wine className="w-24 h-24 text-wine-dark mx-auto mb-6" />
          <p className="text-2xl text-gray-700 mb-4 italic">
            "Wine is sunlight, held together by water."
          </p>
          <p className="text-sm text-gray-500 mb-8">— Galileo Galilei</p>
          <p className="mt-4 text-lg text-gray-600 mb-4">
            Drink Wine, Meet People, Form Community
          </p>
          <p className="text-base text-gray-600 mb-12">
            Drink wine with (at least) seven strangers.
          </p>

          <div className="space-y-4">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-sunburst-600 hover:bg-sunburst-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started
            </Link>

            <div className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-sunburst-600 hover:text-sunburst-700 font-medium underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
