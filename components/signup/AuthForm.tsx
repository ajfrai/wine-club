'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import type { ClubType } from '@/types/auth.types';

// Validation schema for signup
const signupSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Validation schema for login
const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required'),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

interface AuthFormProps {
  clubType: ClubType;
  onSignup: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  clubType,
  onSignup,
  onLogin,
  isLoading = false,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignupSubmit = async (data: SignupFormData) => {
    console.log('[AuthForm] Signup form submitted');
    console.log('[AuthForm] Email:', data.email);
    console.log('[AuthForm] Full name:', data.fullName);
    console.log('[AuthForm] Calling onSignup callback');
    await onSignup({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    });
    console.log('[AuthForm] onSignup callback completed');
  };

  const handleLoginSubmit = async (data: LoginFormData) => {
    console.log('[AuthForm] Login form submitted');
    console.log('[AuthForm] Email:', data.email);
    console.log('[AuthForm] Calling onLogin callback');
    await onLogin(data);
    console.log('[AuthForm] onLogin callback completed');
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-8 w-full">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-gray-900 mb-3">
            {clubType === 'multi_host'
              ? "You'll need a member account to create a friend-group club"
              : "Create or sign in to your account"}
          </h2>
          <p className="text-gray-600">
            {mode === 'signup'
              ? 'Create a new account to continue'
              : 'Sign in to your existing account'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-wine-dark shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white text-wine-dark shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
          </div>

          {mode === 'signup' ? (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                error={signupForm.formState.errors.fullName?.message}
                required
                {...signupForm.register('fullName')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={signupForm.formState.errors.email?.message}
                required
                {...signupForm.register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={signupForm.formState.errors.password?.message}
                helperText="At least 8 characters with uppercase, lowercase, and number"
                required
                {...signupForm.register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={signupForm.formState.errors.confirmPassword?.message}
                required
                {...signupForm.register('confirmPassword')}
              />

              <Button type="submit" isLoading={isLoading} className="w-full mt-6">
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={loginForm.formState.errors.email?.message}
                required
                {...loginForm.register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={loginForm.formState.errors.password?.message}
                required
                {...loginForm.register('password')}
              />

              <Button type="submit" isLoading={isLoading} className="w-full mt-6">
                Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
