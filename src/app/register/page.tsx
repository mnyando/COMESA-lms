'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Lock, Mail, User } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-2xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-md mx-auto">
          <img
            src="/logo.png"
            alt="COMESA Competition & Consumer Commission Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Create Public Account</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Minimum personal data collected (name & email only) for progress tracking.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-[#4168DD]"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-[#4168DD]"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-[#4168DD]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#4168DD] hover:bg-[#3352C4] font-bold text-white text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creating Account...' : 'Create Account & Continue'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/register" className="font-bold text-[#4168DD] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading Register...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
