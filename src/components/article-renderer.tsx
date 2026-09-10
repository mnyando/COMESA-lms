'use client';

import React from 'react';
import Image from 'next/image';
import { AlertCircle, Info, Lightbulb } from 'lucide-react';

export interface ContentBlock {
  id?: string;
  type: 'heading' | 'paragraph' | 'callout' | 'list' | 'image' | 'videoEmbed';
  level?: 1 | 2 | 3;
  text?: string;
  calloutType?: 'tip' | 'warning' | 'note';
  items?: string[];
  url?: string;
  caption?: string;
}

export function ArticleRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
        No content available for this lesson.
      </div>
    );
  }

  return (
    <div className="article-content space-y-6 max-w-3xl mx-auto">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            if (block.level === 1) {
              return <h1 key={idx} className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-8 mb-4">{block.text}</h1>;
            }
            if (block.level === 2) {
              return <h2 key={idx} className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-6 mb-3">{block.text}</h2>;
            }
            return <h3 key={idx} className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 mt-4 mb-2">{block.text}</h3>;

          case 'paragraph':
            return (
              <p key={idx} className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {block.text}
              </p>
            );

          case 'callout':
            const isTip = block.calloutType === 'tip';
            const isWarning = block.calloutType === 'warning';
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border my-6 flex items-start gap-3 text-sm ${
                  isTip
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                    : isWarning
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {isTip && <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
                {!isTip && !isWarning && <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />}
                <div>{block.text}</div>
              </div>
            );

          case 'list':
            return (
              <ul key={idx} className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                {block.items?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case 'image':
            return (
              <figure key={idx} className="my-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={block.url || ''}
                    alt={block.caption || 'Lesson illustration'}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
