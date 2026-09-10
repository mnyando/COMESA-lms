'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './theme-toggle';
import { BookOpen, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Official Brand Logo + Text */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <img
              src="/logo.png"
              alt="COMESA Competition & Consumer Commission Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50 leading-tight flex items-center gap-1.5">
              COMESA <span className="text-[#4168DD] font-semibold">CCCC</span>
              <span className="w-2 h-2 rounded-full bg-[#34C64A]" title="Official Verification" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Consumer Welfare & Advocacy
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-[#4168DD] transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#34C64A]" />
            Course Catalog
          </Link>
          {isAdmin && (
            <Link
              href="/admin/courses"
              className="text-[#4168DD] hover:text-[#3352C4] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-900"
            >
              <LayoutDashboard className="w-4 h-4 text-[#34C64A]" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Actions & Session */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.name}</span>
                <span className="text-[10px] text-[#34C64A] font-bold capitalize">{user?.role?.toLowerCase()}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#4168DD] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#4168DD] hover:bg-[#3352C4] rounded-xl transition-colors shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
