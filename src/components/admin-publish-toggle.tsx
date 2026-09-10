'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function AdminPublishToggle({
  courseId,
  lessonId,
  initialPublished,
}: {
  courseId?: string;
  lessonId?: string;
  initialPublished: boolean;
}) {
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, published: !published }),
      });
      if (res.ok) {
        setPublished(!published);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
        published
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
      }`}
    >
      {published ? <Eye className="w-3 h-3 text-emerald-500" /> : <EyeOff className="w-3 h-3" />}
      {published ? 'Published' : 'Draft'}
    </button>
  );
}
