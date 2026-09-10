'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Lock, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Logo Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-md mx-auto">
          <img
            src="/logo.png"
            alt="COMESA Competition & Consumer Commission Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Sign In to COMESA LMS</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your advocacy course progress or admin dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Demo Accounts Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-300">Seeded Credentials:</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-brand-500">Admin</span>
            <span>admin@comesa.int</span>
            <span className="block text-slate-400">Admin123!</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="font-bold block text-emerald-500">Learner</span>
            <span>consumer@comesa.int</span>
            <span className="block text-slate-400">Learner123!</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleLogin} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Don't have a public learner account?{' '}
        <Link href="/register" className="font-bold text-brand-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading Login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
