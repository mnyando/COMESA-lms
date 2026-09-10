import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ArticleRenderer, ContentBlock } from '@/components/article-renderer';
import { LessonControlBar } from '@/components/lesson-control-bar';
import { ArrowLeft, BookOpen, CheckCircle, Video, FileText, Lock } from 'lucide-react';
import { CustomVideoPlayer } from '@/components/custom-video-player';

export const revalidate = 0;

export default async function LessonViewPage({
  params,
}: {
  params: { slug: string; lessonId: string };
}) {
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

  if (!course) notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLessonIndex = allLessons.findIndex((l) => l.id === params.lessonId);
  const lesson = allLessons[currentLessonIndex];

  if (!lesson) notFound();

  const nextLesson = allLessons[currentLessonIndex + 1];

  let userProgress = null;
  if (user?.id) {
    userProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lesson.id,
        },
      },
    });
  }

  const contentBlocks = (lesson.contentBlocks as unknown as ContentBlock[]) || [];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-16 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {course.title}
          </Link>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-sm">
            {lesson.title}
          </span>
        </div>
      </div>

      {/* Main Reading / Video Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Lesson Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-brand-600 dark:text-brand-400 text-xs font-semibold">
            {lesson.type === 'VIDEO' ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {lesson.type === 'VIDEO' ? 'Video Lesson' : 'Advocacy Article'}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Video Player Block if VIDEO type */}
        {lesson.type === 'VIDEO' && lesson.videoUrl && (
          <div className="space-y-4">
            <CustomVideoPlayer
              src={lesson.videoUrl}
              poster={lesson.videoThumbnailUrl || undefined}
              initialPositionSeconds={userProgress?.lastPositionSeconds || 0}
            />
          </div>
        )}

        {/* Article Reading Layout (Typeset HTML render for both TEXT and CONVERTED_DOCUMENT) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
          <ArticleRenderer blocks={contentBlocks} />
        </div>

        {/* Interactive Bottom Control Bar */}
        <LessonControlBar
          lessonId={lesson.id}
          courseSlug={course.slug}
          nextLessonId={nextLesson?.id}
          initialCompleted={userProgress?.completed || false}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
