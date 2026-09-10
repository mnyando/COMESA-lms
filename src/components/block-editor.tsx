'use client';

import React, { useState } from 'react';
import { ContentBlock } from './article-renderer';
import {
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  Lightbulb,
  List,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react';

interface BlockEditorProps {
  initialBlocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ initialBlocks, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialBlocks && initialBlocks.length > 0
      ? initialBlocks
      : [
          { type: 'heading', level: 1, text: 'Lesson Title' },
          { type: 'paragraph', text: 'Start writing your advocacy lesson content here...' },
        ]
  );

  const updateBlocks = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const updateBlockText = (index: number, text: string) => {
    const next = [...blocks];
    next[index].text = text;
    updateBlocks(next);
  };

  const updateBlockCallout = (index: number, calloutType: 'tip' | 'warning' | 'note') => {
    const next = [...blocks];
    next[index].calloutType = calloutType;
    updateBlocks(next);
  };

  const updateListItem = (blockIndex: number, itemIndex: number, text: string) => {
    const next = [...blocks];
    if (next[blockIndex].items) {
      next[blockIndex].items![itemIndex] = text;
      updateBlocks(next);
    }
  };

  const addListItem = (blockIndex: number) => {
    const next = [...blocks];
    if (!next[blockIndex].items) next[blockIndex].items = [];
    next[blockIndex].items!.push('New list point');
    updateBlocks(next);
  };

  const removeListItem = (blockIndex: number, itemIndex: number) => {
    const next = [...blocks];
    if (next[blockIndex].items) {
      next[blockIndex].items!.splice(itemIndex, 1);
      updateBlocks(next);
    }
  };

  const addBlock = (type: ContentBlock['type'], level?: 1 | 2 | 3) => {
    const newBlock: ContentBlock = { type };
    if (type === 'heading') {
      newBlock.level = level || 1;
      newBlock.text = 'Heading text';
    } else if (type === 'paragraph') {
      newBlock.text = 'New paragraph text...';
    } else if (type === 'callout') {
      newBlock.calloutType = 'tip';
      newBlock.text = 'Key advocacy tip or notice for consumers...';
    } else if (type === 'list') {
      newBlock.items = ['First point', 'Second point'];
    } else if (type === 'image') {
      newBlock.url = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80';
      newBlock.caption = 'Image caption';
    }
    updateBlocks([...blocks, newBlock]);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const next = [...blocks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    updateBlocks(next);
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    updateBlocks(next);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Editor Toolbar */}
      <div className="sticky top-20 z-30 flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-semibold text-slate-400 px-2">Add Block:</span>
        <button
          type="button"
          onClick={() => addBlock('heading', 1)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <Heading1 className="w-3.5 h-3.5" /> H1
        </button>
        <button
          type="button"
          onClick={() => addBlock('heading', 2)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <Heading2 className="w-3.5 h-3.5" /> H2
        </button>
        <button
          type="button"
          onClick={() => addBlock('heading', 3)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <Heading3 className="w-3.5 h-3.5" /> H3
        </button>
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <AlignLeft className="w-3.5 h-3.5" /> Paragraph
        </button>
        <button
          type="button"
          onClick={() => addBlock('callout')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Callout
        </button>
        <button
          type="button"
          onClick={() => addBlock('list')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <List className="w-3.5 h-3.5" /> List
        </button>
        <button
          type="button"
          onClick={() => addBlock('image')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-800"
        >
          <ImageIcon className="w-3.5 h-3.5" /> Image
        </button>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="group relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            {/* Block Action Controls */}
            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => moveBlock(idx, 'up')}
                disabled={idx === 0}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(idx, 'down')}
                disabled={idx === blocks.length - 1}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(idx)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Block Input Content */}
            {block.type === 'heading' && (
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-500">Heading Level {block.level}</span>
                <input
                  type="text"
                  value={block.text || ''}
                  onChange={(e) => updateBlockText(idx, e.target.value)}
                  className={`w-full mt-1 bg-transparent border-b border-transparent focus:border-brand-500 outline-none font-bold text-slate-900 dark:text-slate-50 ${
                    block.level === 1 ? 'text-2xl' : block.level === 2 ? 'text-xl' : 'text-lg'
                  }`}
                  placeholder="Heading text..."
                />
              </div>
            )}

            {block.type === 'paragraph' && (
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Paragraph</span>
                <textarea
                  value={block.text || ''}
                  onChange={(e) => updateBlockText(idx, e.target.value)}
                  rows={3}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-sm text-slate-800 dark:text-slate-200 leading-relaxed resize-y"
                  placeholder="Paragraph text..."
                />
              </div>
            )}

            {block.type === 'callout' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-semibold text-amber-500">Callout Box</span>
                  <select
                    value={block.calloutType || 'tip'}
                    onChange={(e) => updateBlockCallout(idx, e.target.value as any)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5"
                  >
                    <option value="tip">Tip / Takeaway</option>
                    <option value="warning">Warning</option>
                    <option value="note">General Note</option>
                  </select>
                </div>
                <textarea
                  value={block.text || ''}
                  onChange={(e) => updateBlockText(idx, e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 text-sm text-slate-800 dark:text-slate-200"
                  placeholder="Callout text..."
                />
              </div>
            )}

            {block.type === 'list' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400">List Items</span>
                <div className="space-y-2">
                  {block.items?.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateListItem(idx, itemIdx, e.target.value)}
                        className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(idx, itemIdx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(idx)}
                    className="text-xs text-brand-500 font-medium flex items-center gap-1 hover:underline pt-1"
                  >
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
              </div>
            )}

            {block.type === 'image' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Image Block</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={block.url || ''}
                    onChange={(e) => {
                      const next = [...blocks];
                      next[idx].url = e.target.value;
                      updateBlocks(next);
                    }}
                    placeholder="Image URL..."
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                  <input
                    type="text"
                    value={block.caption || ''}
                    onChange={(e) => {
                      const next = [...blocks];
                      next[idx].caption = e.target.value;
                      updateBlocks(next);
                    }}
                    placeholder="Caption (optional)..."
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                </div>
                {block.url && (
                  <div className="mt-2 rounded-xl overflow-hidden max-h-40 border border-slate-200 dark:border-slate-800">
                    <img src={block.url} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
