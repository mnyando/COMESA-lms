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
      <section className="relative bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-white p-2 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src="/logo.png"
              alt="COMESA Competition & Consumer Commission Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0FDF4] dark:bg-emerald-950/50 border border-[#BBF7D0] dark:border-emerald-800 text-[#21852F] dark:text-[#34C64A] text-xs font-semibold">
            <Shield className="w-4 h-4 text-[#34C64A]" />
            Official COMESA Competition & Consumer Commission Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Know Your Rights. <span className="text-[#4168DD]">Protect Your Business.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Free, accessible educational modules for consumers and small business owners across 21 COMESA Member States on competition law, fair trade, and consumer rights.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-semibold pt-2">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#34C64A]" /> 100% Free Public Access</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#34C64A]" /> Plain Language Guides</span>
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-[#4168DD]" /> Verified Legal Frameworks</span>
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-[#4168DD] transition-colors"
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
                  className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#4168DD]/40 dark:hover:border-[#4168DD]/40 transition-all hover:shadow-md overflow-hidden"
                >
                  <div>
                    {course.coverImage && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#34C64A]" />
                          {course.modules.length} Modules • {totalLessons} Lessons
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-[#4168DD] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#34C64A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Free Public Access
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#4168DD] hover:text-[#3352C4] transition-colors"
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
