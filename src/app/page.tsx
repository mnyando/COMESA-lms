import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Shield, BookOpen, ChevronRight, Award, CheckCircle2, Search } from 'lucide-react';

export const revalidate = 0;

export default async function CatalogPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      modules: {
        include: {
          lessons: {
            where: { published: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen space-y-12 pb-16">
      {/* Advocacy Hero Banner */}
      <section className="relative bg-gradient-to-b from-brand-50/50 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white p-2 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src="/logo.png"
              alt="COMESA Competition & Consumer Commission Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            Official COMESA Competition & Consumer Commission Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Know Your Rights. <span className="text-brand-500">Protect Your Business.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Free, accessible educational modules for consumers and small business owners across 21 COMESA Member States on competition law, fair trade, and consumer rights.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> 100% Free Public Access</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-500" /> Plain Language Guides</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-brand-500" /> Verified Legal Frameworks</span>
          </div>
        </div>
      </section>

      {/* Main Catalog Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Public Course Catalog</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Browse available advocacy topics without an account.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses & topics..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No Published Courses Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check back soon for new advocacy modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

              return (
                <div
                  key={course.id}
                  className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md overflow-hidden"
                >
                  <div>
                    {course.coverImage && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-[11px] font-semibold text-white">
                          {course.modules.length} Modules • {totalLessons} Lessons
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-brand-500 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      Free Access
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors"
                    >
                      View Course <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
