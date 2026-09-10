import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Plus, BookOpen, Layers, Edit, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { AdminPublishToggle } from '@/components/admin-publish-toggle';

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/courses');
  }

  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" /> CCCC Admin Management Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Advocacy Course Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build courses, create modules, and manage advocacy lessons across Member States.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create New Course
        </Link>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 gap-4">
        {courses.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No Courses Created Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get started by creating your first advocacy course.</p>
          </div>
        ) : (
          courses.map((course) => {
            const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

            return (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{course.title}</h2>
                    <AdminPublishToggle courseId={course.id} initialPublished={course.published} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 max-w-3xl">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-brand-500" /> {course.modules.length} Modules</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-brand-500" /> {totalLessons} Lessons</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <Link
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Public View
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/builder`}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Course Builder
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
