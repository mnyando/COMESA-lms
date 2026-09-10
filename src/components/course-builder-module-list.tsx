'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Video,
  FileText,
  FileUp,
  Layers,
  Trash2,
  Edit,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
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

  // Module Editing State
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [savingModule, setSavingModule] = useState(false);

  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

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

  const handleStartEditModule = (mod: any) => {
    setEditingModuleId(mod.id);
    setEditingModuleTitle(mod.title);
  };

  const handleSaveModuleTitle = async (moduleId: string) => {
    if (!editingModuleTitle.trim()) return;

    try {
      setSavingModule(true);
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingModuleTitle }),
      });

      if (res.ok) {
        setEditingModuleId(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${moduleTitle}" and all its lessons? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to delete module:', e);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to delete lesson:', e);
    }
  };

  // Reorder Modules
  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= modules.length) return;

    const reordered = [...modules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIdx, 0, moved);

    setModules(reordered);

    try {
      const orderedIds = reordered.map((m) => m.id);
      const res = await fetch('/api/admin/modules/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, orderedIds }),
      });

      if (!res.ok) {
        setModules(initialModules);
      } else {
        router.refresh();
      }
    } catch (e) {
      console.error('Module reorder failed:', e);
      setModules(initialModules);
    }
  };

  // Reorder Lessons inside Module
  const handleMoveLesson = async (moduleIndex: number, lessonIndex: number, direction: 'up' | 'down') => {
    const mod = modules[moduleIndex];
    const newIdx = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (newIdx < 0 || newIdx >= mod.lessons.length) return;

    const updatedLessons = [...mod.lessons];
    const [moved] = updatedLessons.splice(lessonIndex, 1);
    updatedLessons.splice(newIdx, 0, moved);

    const updatedModules = [...modules];
    updatedModules[moduleIndex] = { ...mod, lessons: updatedLessons };
    setModules(updatedModules);

    try {
      const orderedIds = updatedLessons.map((l) => l.id);
      const res = await fetch('/api/admin/lessons/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: mod.id, orderedIds }),
      });

      if (!res.ok) {
        setModules(initialModules);
      } else {
        router.refresh();
      }
    } catch (e) {
      console.error('Lesson reorder failed:', e);
      setModules(initialModules);
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
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-0.5 mr-1">
                <button
                  type="button"
                  disabled={mIdx === 0}
                  onClick={() => handleMoveModule(mIdx, 'up')}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                  title="Move module up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={mIdx === modules.length - 1}
                  onClick={() => handleMoveModule(mIdx, 'down')}
                  className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                  title="Move module down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <Layers className="w-4 h-4 text-[#4168DD] shrink-0" />
              {editingModuleId === mod.id ? (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    value={editingModuleTitle}
                    onChange={(e) => setEditingModuleTitle(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:border-[#4168DD]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveModuleTitle(mod.id)}
                    disabled={savingModule}
                    className="p-1 rounded-lg bg-[#34C64A] text-white hover:bg-emerald-600"
                    title="Save title"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingModuleId(null)}
                    className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Module {mIdx + 1}: {mod.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleStartEditModule(mod)}
                    className="p-1 text-slate-400 hover:text-[#4168DD] transition-colors"
                    title="Edit Module Title"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDeleteModule(mod.id, mod.title)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Delete Module"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <Link
                href={`/admin/courses/${courseId}/lessons/new?moduleId=${mod.id}`}
                className="px-3 py-1.5 rounded-xl bg-[#4168DD] hover:bg-[#3352C4] font-bold text-white text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#34C64A]" /> Add Lesson
              </Link>
            </div>
          </div>

          {/* Lessons in Module */}
          <div className="p-4 space-y-3">
            {mod.lessons.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 italic">
                No lessons in this module yet. Click "+ Add Lesson" to add content.
              </div>
            ) : (
              mod.lessons.map((lesson: any, lIdx: number) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={lIdx === 0}
                        onClick={() => handleMoveLesson(mIdx, lIdx, 'up')}
                        className="p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                        title="Move lesson up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={lIdx === mod.lessons.length - 1}
                        onClick={() => handleMoveLesson(mIdx, lIdx, 'down')}
                        className="p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                        title="Move lesson down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {lesson.type === 'VIDEO' ? (
                      <Video className="w-4 h-4 text-[#4168DD] shrink-0" />
                    ) : lesson.type === 'CONVERTED_DOCUMENT' ? (
                      <FileUp className="w-4 h-4 text-[#34C64A] shrink-0" />
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

                  <div className="flex items-center gap-2">
                    <AdminPublishToggle lessonId={lesson.id} initialPublished={lesson.published} />
                    <Link
                      href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#4168DD] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Lesson"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Add New Module Form */}
      <form
        onSubmit={handleAddModule}
        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title (e.g. Module 2: Cross-Border Consumer Redress)..."
          className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#4168DD]"
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
