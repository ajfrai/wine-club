'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/login.schema';
import { login, checkDualRoleStatus } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Wine } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // User is already logged in, check their roles and redirect
        const dualRoleStatus = await checkDualRoleStatus(user.id, supabase);

        if (dualRoleStatus.isDualRole) {
          // For dual-role users, check localStorage for last dashboard preference
          const lastDashboard = localStorage.getItem('lastDashboard');
          if (lastDashboard === 'host' || lastDashboard === 'member') {
            router.replace(`/dashboard/${lastDashboard}`);
          } else {
            // Default to host dashboard for dual-role users if no preference
            router.replace('/dashboard/host');
          }
        } else if (dualRoleStatus.hasHostProfile) {
          router.replace('/dashboard/host');
        } else {
          router.replace('/dashboard/member');
        }
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const response = await login(data, supabase);

    if (!response.success) {
      setError(response.error || 'Login failed');
      setIsLoading(false);
      return;
    }

    // Check dual-role status and redirect appropriately
    const supabaseForRoleCheck = createClient();
    const dualRoleStatus = await checkDualRoleStatus(response.user!.id, supabaseForRoleCheck);

    if (dualRoleStatus.isDualRole) {
      // For dual-role users, check localStorage for last dashboard preference
      const lastDashboard = localStorage.getItem('lastDashboard');
      if (lastDashboard === 'host' || lastDashboard === 'member') {
        router.replace(`/dashboard/${lastDashboard}`);
      } else {
        // Default to host dashboard for dual-role users if no preference
        router.replace('/dashboard/host');
      }
    } else if (dualRoleStatus.hasHostProfile) {
      router.replace('/dashboard/host');
    } else {
      router.replace('/dashboard/member');
    }
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light flex items-center justify-center">
        <div className="text-wine-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunburst-50 to-wine-light flex items-center justify-center p-4">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-red-50 border border-red-500 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-start">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Wine className="w-12 h-12 text-wine-dark mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-wine-dark">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your Wine Club account</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-sunburst-600 hover:text-sunburst-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
