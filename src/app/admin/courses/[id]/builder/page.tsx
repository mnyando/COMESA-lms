import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Plus, Video, FileText, FileUp, Edit, Layers, Trash2 } from 'lucide-react';
import { CourseBuilderModuleList } from '@/components/course-builder-module-list';

export const revalidate = 0;

export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.role !== 'ADMIN') {
    redirect('/login');
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs font-mono text-slate-400">Course ID: {course.id}</span>
      </div>

      {/* Course Builder Title Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Course Builder</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">{course.title}</h1>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors shrink-0"
        >
          Preview Course Page
        </Link>
      </div>

      {/* Modules and Lessons Builder Component */}
      <CourseBuilderModuleList courseId={course.id} initialModules={course.modules} />
    </div>
  );
}
