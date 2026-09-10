'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, FileUp, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { BlockEditor } from '@/components/block-editor';
import { ContentBlock } from '@/components/article-renderer';

function NewLessonForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId') || '';

  const [activeTab, setActiveTab] = useState<'text' | 'video' | 'pdf'>('text');
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { type: 'heading', level: 1, text: 'Lesson Title' },
    { type: 'paragraph', text: 'Write advocacy information here...' },
  ]);

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');

  // PDF Conversion State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfConverting, setPdfConverting] = useState(false);
  const [pdfConverted, setPdfConverted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      setPdfFile(file);
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
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      setPdfConverted(true);
      setActiveTab('text');
    } catch (err: any) {
      setError(err.message || 'PDF extraction failed');
    } finally {
      setPdfConverting(false);
    }
  };

  const handleSaveLesson = async (published: boolean) => {
    if (!title.trim()) {
      setError('Lesson title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        courseId,
        moduleId,
        title,
        type: activeTab === 'video' ? 'VIDEO' : pdfConverted ? 'CONVERTED_DOCUMENT' : 'TEXT',
        contentBlocks: blocks,
        videoUrl: activeTab === 'video' ? videoUrl : null,
        videoThumbnailUrl: activeTab === 'video' ? videoThumbnailUrl : null,
        published,
      };

      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save lesson');
      }

      router.push(`/admin/courses/${courseId}/builder`);
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setSubmitting(false);
    }
  };

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
        <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Lesson Creator</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Create New Lesson</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose one of the 3 independent content entry points below.
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
          placeholder="e.g. Identifying Deceptive Price Advertising"
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-brand-500 font-bold"
        />
      </div>

      {/* 3 THREE FULLY INDEPENDENT ENTRY POINTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'text'
              ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Write Text</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Direct block-based rich text editor for quick advocacy explainers and FAQs.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'video'
              ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Upload Video</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload MP4/WebM video, auto-generate thumbnail, and embed custom player.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pdf')}
          className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all ${
            activeTab === 'pdf'
              ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Upload PDF</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Extract headings, paragraphs & images into the block editor for review.
            </p>
          </div>
        </button>
      </div>

      {activeTab === 'video' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-500" /> Video Upload & Thumbnail Pipeline
          </h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            {videoUploading ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Uploading video & extracting FFmpeg thumbnail...
                </p>
              </div>
            ) : videoUrl ? (
              <div className="space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Video Processed Successfully!</p>
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-md mx-auto">{videoUrl}</p>
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
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white text-xs cursor-pointer inline-flex items-center gap-2 transition-colors shadow-sm"
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
            <Sparkles className="w-4 h-4 text-amber-500" /> PDF Structured Document Conversion Pipeline
          </h3>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            {pdfConverting ? (
              <div className="space-y-2 py-4">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parsing PDF headings, paragraphs & extracting embedded images...
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
                  Select PDF Document
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {pdfConverted ? 'Review Extracted PDF Content Blocks' : 'Lesson Content Block Editor'}
          </h3>
          <span className="text-xs text-slate-400">Zero PDF embeds — HTML typesetting</span>
        </div>

        <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shadow-sm">
        <button
          type="button"
          onClick={() => handleSaveLesson(false)}
          disabled={submitting}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          Save as Draft
        </button>

        <button
          type="button"
          onClick={() => handleSaveLesson(true)}
          disabled={submitting}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : 'Save & Publish Lesson'}
        </button>
      </div>
    </div>
  );
}

export default function NewLessonPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading Creator...</div>}>
        <NewLessonForm courseId={params.id} />
      </Suspense>
    </div>
  );
}
