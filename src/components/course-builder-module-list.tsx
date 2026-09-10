'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Video, FileText, FileUp, Layers, Trash2, Edit } from 'lucide-react';
import { AdminPublishToggle } from './admin-publish-toggle';

export function CourseBuilderModuleList({
  courseId,
  initialModules,
}: {
  courseId: string;
  initialModules: any[];
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      setAddingModule(true);
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModuleTitle }),
      });

      if (res.ok) {
        setNewModuleTitle('');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingModule(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modules List */}
      {modules.map((mod, mIdx) => (
        <div
          key={mod.id}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
        >
          {/* Module Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Module {mIdx + 1}: {mod.title}
              </h3>
            </div>

            <Link
              href={`/admin/courses/${courseId}/lessons/new?moduleId=${mod.id}`}
              className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lesson
            </Link>
          </div>

          {/* Lessons in Module */}
          <div className="p-4 space-y-3">
            {mod.lessons.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                No lessons in this module yet. Click "+ Add Lesson" to add content.
              </div>
            ) : (
              mod.lessons.map((lesson: any) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {lesson.type === 'VIDEO' ? (
                      <Video className="w-4 h-4 text-brand-500 shrink-0" />
                    ) : lesson.type === 'CONVERTED_DOCUMENT' ? (
                      <FileUp className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    )}

                    <div>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {lesson.title}
                      </span>
                      <span className="ml-2 text-[10px] uppercase font-mono text-slate-400">
                        ({lesson.type.toLowerCase().replace('_', ' ')})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <AdminPublishToggle lessonId={lesson.id} initialPublished={lesson.published} />
                    <Link
                      href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                      className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Edit Lesson"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Add New Module Form */}
      <form onSubmit={handleAddModule} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex items-center gap-3">
        <input
          type="text"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title (e.g. Module 2: Cross-Border Consumer Redress)..."
          className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={addingModule || !newModuleTitle.trim()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 font-bold text-white dark:text-slate-900 text-xs transition-colors shrink-0 disabled:opacity-50"
        >
          {addingModule ? 'Adding...' : '+ Add Module'}
        </button>
      </form>
    </div>
  );
}
