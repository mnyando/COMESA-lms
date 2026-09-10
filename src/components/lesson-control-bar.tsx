'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react';

interface LessonControlBarProps {
  lessonId: string;
  courseSlug: string;
  nextLessonId?: string;
  initialCompleted: boolean;
  isLoggedIn: boolean;
}

export function LessonControlBar({
  lessonId,
  courseSlug,
  nextLessonId,
  initialCompleted,
  isLoggedIn,
}: LessonControlBarProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggleComplete = async () => {
    if (!isLoggedIn) {
      router.push(`/register?callbackUrl=/courses/${courseSlug}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          completed: !completed,
        }),
      });

      if (res.ok) {
        setCompleted(!completed);
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to update progress', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {isLoggedIn ? (
        <button
          onClick={toggleComplete}
          disabled={loading}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            completed
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {completed ? 'Completed ✓' : 'Mark as Complete'}
        </button>
      ) : (
        <Link
          href={`/register?callbackUrl=/courses/${courseSlug}`}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2"
        >
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Sign in to save your completion progress</span>
        </Link>
      )}

      {nextLessonId ? (
        <Link
          href={`/courses/${courseSlug}/lessons/${nextLessonId}`}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          Next Lesson <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <Link
          href={`/courses/${courseSlug}`}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 font-bold text-white dark:text-slate-900 text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          Finish Course Overview
        </Link>
      )}
    </div>
  );
}
