'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

function EditCourseForm({ courseId }: { courseId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/courses/${courseId}`);
        // If GET endpoint is route handler or prisma client fetch:
        if (!res.ok) {
          const resCourses = await fetch('/api/admin/courses');
          // Alternatively fetch course via direct API or public page fallback
        }
      } catch (e) {
        // Handled below
      }
    }
  }, [courseId]);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true);
        // We can fetch via public/admin course endpoint or direct fetch
        const res = await fetch('/api/admin/courses');
        if (res.ok) {
          const courses = await res.json();
          const found = courses.find((c: any) => c.id === courseId);
          if (found) {
            setTitle(found.title || '');
            setDescription(found.description || '');
            setCategory(found.category || '');
            setCoverImage(found.coverImage || '');
            setPublished(found.published || false);
          }
        }
      } catch (err: any) {
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    }
    fetchCourseDetails();
  }, [courseId]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');

      setCoverImage(data.url);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          coverImage,
          published,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update course');
      }

      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Are you SURE you want to delete this course and ALL its modules and lessons? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete course.');
      router.push('/admin/courses');
    } catch (err: any) {
      setError(err.message || 'Failed to delete course.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#4168DD] animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading course metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={handleDeleteCourse}
          disabled={deleting}
          className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete Course'}
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Edit Course Metadata</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Update advocacy course title, public summary description, cover image, and publishing status.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSaveCourse} className="space-y-6">
        {/* Title */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Course Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course Title"
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-[#4168DD] font-bold"
          />
        </div>

        {/* Description */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Public Overview Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the advocacy course..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-[#4168DD] leading-relaxed"
          />
        </div>

        {/* Category & Cover Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category / Pillar
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Consumer Rights or Competition Law"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs outline-none focus:border-[#4168DD]"
            />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#34C64A]" /> Cover Image URL / Upload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/consumer.jpg or image URL..."
                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#4168DD]"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
                id="cover-file-input"
              />
              <label
                htmlFor="cover-file-input"
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shrink-0 transition-colors"
              >
                {uploadingImage ? 'Uploading...' : 'Browse File'}
              </label>
            </div>
            {coverImage && (
              <div className="mt-2 relative rounded-xl overflow-hidden h-28 border border-slate-200 dark:border-slate-800">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Publish Checkbox */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Course Visibility</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Published courses are visible on the public homepage for consumers and businesses.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C64A]"></div>
          </label>
        </div>

        {/* Actions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shadow-sm">
          <Link
            href="/admin/courses"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-[#4168DD] hover:bg-[#3352C4] text-xs font-bold text-white transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Course Metadata'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading Form...</div>}>
        <EditCourseForm courseId={params.id} />
      </Suspense>
    </div>
  );
}
