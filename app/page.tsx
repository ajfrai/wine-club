'use client';

import Link from 'next/link';
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
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-sunburst-50 to-wine-light">
        <div className="text-center max-w-3xl">
          <Wine className="w-24 h-24 text-wine-dark mx-auto mb-6" />
          <p className="text-2xl text-gray-700 mb-4 italic">
            "Wine is sunlight, held together by water."
          </p>
          <p className="text-sm text-gray-500 mb-8">— Galileo Galilei</p>
          <p className="mt-4 text-lg text-gray-600 mb-12">
            Drink Wine, Meet People, Form Community
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-wine hover:bg-wine-dark text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 bg-wine-light hover:bg-sunburst-200 text-wine-dark text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
