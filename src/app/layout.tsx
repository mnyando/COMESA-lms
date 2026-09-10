import './globals.css';
import React from 'react';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';

export const metadata = {
  title: 'COMESA CCCC | Public Consumer Education & Advocacy Platform',
  description: 'Learn your consumer rights, file cross-border complaints, and access competition law resources across COMESA Member States.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-50 dark:bg-slate-900/50 mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>© {new Date().getFullYear()} COMESA Competition & Consumer Commission (CCCC). Public Advocacy Portal.</p>
              <p className="mt-1">Empowering consumers and promoting fair trade across 21 COMESA Member States.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
