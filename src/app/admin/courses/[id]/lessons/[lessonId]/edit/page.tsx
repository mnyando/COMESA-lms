'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, FileUp, Loader2, CheckCircle2, Sparkles, Save, Trash2 } from 'lucide-react';
import { BlockEditor } from '@/components/block-editor';
import { ContentBlock } from '@/components/article-renderer';

function EditLessonForm({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'text' | 'video' | 'pdf'>('text');
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');

  // PDF Conversion State
  const [pdfConverting, setPdfConverting] = useState(false);
  const [pdfConverted, setPdfConverted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/lessons/${lessonId}`);
        if (!res.ok) throw new Error('Failed to load lesson details.');
        const lesson = await res.json();

        setTitle(lesson.title || '');
        if (lesson.type === 'VIDEO') {
          setActiveTab('video');
        } else {
          setActiveTab('text');
        }
        setVideoUrl(lesson.videoUrl || '');
        setVideoThumbnailUrl(lesson.videoThumbnailUrl || '');
        if (Array.isArray(lesson.contentBlocks)) {
          setBlocks(lesson.contentBlocks);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading lesson.');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonId]);

  // Video Upload Handler
  const handleVideoUpload = async (file: File) => {
    try {
      setVideoFile(file);
      setVideoUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video upload failed');

      setVideoUrl(data.url);
      setVideoThumbnailUrl(data.thumbnailUrl || '');
    } catch (err: any) {
      setError(err.message || 'Video processing failed');
    } finally {
      setVideoUploading(false);
    }
  };

  // PDF Conversion Handler
  const handlePdfUpload = async (file: File) => {
    try {
      setPdfConverting(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pdf');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'PDF extraction failed');

      if (data.blocks && data.blocks.length > 0) {
        setBlocks(data.blocks);
      }
      setPdfConverted(true);
      setActiveTab('text');
    } catch (err: any) {
      setError(err.message || 'PDF extraction failed');
    } finally {
      setPdfConverting(false);
    }
  };

  const handleUpdateLesson = async (published: boolean) => {
    if (!title.trim()) {
      setError('Lesson title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        title,
        type: activeTab === 'video' ? 'VIDEO' : pdfConverted ? 'CONVERTED_DOCUMENT' : 'TEXT',
        contentBlocks: blocks,
        videoUrl: activeTab === 'video' ? videoUrl : null,
        videoThumbnailUrl: activeTab === 'video' ? videoThumbnailUrl : null,
        published,
      };

      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update lesson');
      }

      router.push(`/admin/courses/${courseId}/builder`);
    } catch (err: any) {
      setError(err.message || 'Failed to update lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete lesson.');
      router.push(`/admin/courses/${courseId}/builder`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#4168DD] animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading lesson details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href={`/admin/courses/${courseId}/builder`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Course Builder
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4168DD] uppercase tracking-wider">Lesson Editor</span>
          <button
            type="button"
            onClick={handleDeleteLesson}
            disabled={deleting}
            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete Lesson'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Edit Lesson</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Update lesson content, re-convert PDF materials, or update video embeds.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Lesson Title Input */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Lesson Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson Title"
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-[#4168DD] font-bold"
        />
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'text'
              ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#4168DD] shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#4168DD] text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Rich Text & Content</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Block-based editor for advocacy content and headings.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'video'
              ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#4168DD] shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#34C64A] text-white flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Video Content</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload MP4/WebM video and auto-extract thumbnails.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pdf')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'pdf'
              ? 'bg-blue-50/80 dark:bg-blue-950/50 border-[#4168DD] shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Re-convert PDF</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Extract new PDF into block editor elements.
            </p>
          </div>
        </button>
      </div>

      {activeTab === 'video' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-4 h-4 text-[#34C64A]" /> Video Upload Pipeline
          </h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            {videoUploading ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 text-[#4168DD] animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Uploading video & extracting thumbnail...
                </p>
              </div>
            ) : videoUrl ? (
              <div className="space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#34C64A] mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Video Attached!</p>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-md mx-auto">{videoUrl}</p>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                  id="replace-video-input"
                />
                <label
                  htmlFor="replace-video-input"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer inline-block transition-colors"
                >
                  Replace Video File
                </label>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  className="hidden"
                  id="video-input"
                />
                <label
                  htmlFor="video-input"
                  className="px-4 py-2.5 rounded-xl bg-[#34C64A] hover:bg-emerald-600 font-bold text-white text-xs cursor-pointer inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  Select Video File (MP4/WebM)
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> PDF Structured Document Pipeline
          </h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            {pdfConverting ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parsing PDF headings & text...
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                  className="hidden"
                  id="pdf-input"
                />
                <label
                  htmlFor="pdf-input"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs cursor-pointer inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  Select PDF Document to Import
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Lesson Content Block Editor
          </h3>
          <span className="text-xs text-slate-400">Native HTML typesetting (No raw PDF iframe)</span>
        </div>

        <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shadow-sm">
        <button
          type="button"
          onClick={() => handleUpdateLesson(false)}
          disabled={submitting}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleUpdateLesson(true)}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-[#4168DD] hover:bg-[#3352C4] text-xs font-bold text-white transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save & Publish Changes'}
        </button>
      </div>
    </div>
  );
}

export default function EditLessonPage({ params }: { params: { id: string; lessonId: string } }) {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading Editor...</div>}>
        <EditLessonForm courseId={params.id} lessonId={params.lessonId} />
      </Suspense>
    </div>
  );
}
