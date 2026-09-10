import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookOpen, Video, FileText, CheckCircle, PlayCircle, ShieldCheck, Lock } from 'lucide-react';

export const revalidate = 0;

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!course || !course.published) {
    notFound();
  }

  // Get user progress if logged in
  let completedLessonIds: string[] = [];
  if (user?.id) {
    const progressRecords = await prisma.progress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    });
    completedLessonIds = progressRecords.map((p) => p.lessonId);
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const completedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const firstLesson = allLessons[0];

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Course Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-400">
          <ShieldCheck className="w-4 h-4" /> Official COMESA Consumer Rights Module
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
          {course.title}
        </h1>

        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {course.description}
        </p>

        {/* Learner Progress Bar */}
        {user ? (
          <div className="space-y-2 pt-2 max-w-md">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Course Progress</span>
              <span>{progressPercent}% Complete ({completedCount}/{allLessons.length} lessons)</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>Browsing as Guest. Create a free account to track your progress and resume lessons.</span>
            </div>
            <Link
              href={`/register?callbackUrl=/courses/${course.slug}`}
              className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 font-semibold text-white transition-colors shrink-0"
            >
              Sign Up
            </Link>
          </div>
        )}

        {firstLesson && (
          <div>
            <Link
              href={`/courses/${course.slug}/lessons/${firstLesson.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-white text-xs transition-colors shadow-md"
            >
              <PlayCircle className="w-4 h-4" />
              {completedCount > 0 ? 'Continue Course' : 'Start Course'}
            </Link>
          </div>
        )}
      </div>

      {/* Curriculum Outline */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-500" /> Course Curriculum ({course.modules.length} Modules)
        </h2>

        <div className="space-y-4">
          {course.modules.map((module, mIdx) => (
            <div
              key={module.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {module.title}
                </h3>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {module.lessons.length} Lessons
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {module.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/lessons/${lesson.id}`}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : lesson.type === 'VIDEO' ? (
                          <Video className="w-4 h-4 text-brand-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono capitalize">
                          {lesson.type.toLowerCase().replace('_', ' ')}
                        </span>
                        <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
