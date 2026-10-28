import React, { useState } from 'react';
import { FileDiff } from '../../types/patchReview';
import { FileCode, Columns, AlignJustify, Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  diff: FileDiff;
  title?: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diff,
  title,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyRaw = () => {
    let text = `--- a/${diff.oldPath}\n+++ b/${diff.newPath}\n`;
    diff.hunks.forEach((hunk) => {
      text += `${hunk.header}\n`;
      hunk.lines.forEach((line) => {
        const prefix = line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ';
        text += `${prefix} ${line.content}\n`;
      });
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-800 bg-[#0a0e17] font-mono text-xs shadow-xl ${className}`}>
      {/* Diff Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            {title || diff.newPath}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 font-semibold">
              +{diff.additions}
            </span>
            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-400 font-semibold">
              -{diff.deletions}
            </span>
          </div>
        </div>

        {/* View Mode Toggle & Copy Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded border border-slate-700 bg-slate-950 p-0.5">
            <button
              onClick={() => setViewMode('unified')}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
                viewMode === 'unified'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignJustify className="h-3 w-3" />
              <span>Unified</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
                viewMode === 'split'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Split</span>
            </button>
          </div>

          <button
            onClick={handleCopyRaw}
            className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Copy git patch diff"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span>Copy Patch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Diff Body */}
      <div className="overflow-x-auto text-[11px] leading-relaxed select-text">
        {diff.hunks.map((hunk, hIdx) => (
          <div key={hIdx} className="border-b border-slate-800/60 last:border-0">
            {/* Hunk Header */}
            <div className="bg-slate-950/80 px-4 py-1 text-slate-500 font-mono text-[10px] select-none border-y border-slate-800/40">
              {hunk.header}
            </div>

            {viewMode === 'unified' ? (
              /* Unified View */
              <div className="divide-y divide-slate-800/20">
                {hunk.lines.map((line, lIdx) => {
                  const isAdd = line.type === 'add';
                  const isDel = line.type === 'del';

                  return (
                    <div
                      key={lIdx}
                      className={`flex items-stretch font-mono ${
                        isAdd
                          ? 'bg-emerald-950/25 text-emerald-300'
                          : isDel
                          ? 'bg-rose-950/25 text-rose-300'
                          : 'text-slate-300 hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Old Line # */}
                      <span className="w-10 flex-shrink-0 select-none border-r border-slate-800/60 pr-2 text-right text-[10px] text-slate-600">
                        {line.oldLineNumber || ''}
                      </span>
                      {/* New Line # */}
                      <span className="w-10 flex-shrink-0 select-none border-r border-slate-800/60 pr-2 text-right text-[10px] text-slate-600">
                        {line.newLineNumber || ''}
                      </span>
                      {/* Sign indicator */}
                      <span
                        className={`w-5 flex-shrink-0 select-none text-center font-bold ${
                          isAdd
                            ? 'text-emerald-400'
                            : isDel
                            ? 'text-rose-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {isAdd ? '+' : isDel ? '-' : ' '}
                      </span>
                      {/* Code line */}
                      <pre className="flex-1 overflow-x-auto px-2 py-0.5 whitespace-pre font-mono">
                        {line.content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Split View */
              <div className="divide-y divide-slate-800/20">
                {hunk.lines.map((line, lIdx) => {
                  const isAdd = line.type === 'add';
                  const isDel = line.type === 'del';

                  return (
                    <div key={lIdx} className="grid grid-cols-2 divide-x divide-slate-800/60 font-mono">
                      {/* Left side: Old / Deleted */}
                      <div
                        className={`flex items-stretch ${
                          isDel ? 'bg-rose-950/30 text-rose-300' : isAdd ? 'bg-slate-950/40' : 'text-slate-300'
                        }`}
                      >
                        <span className="w-8 select-none pr-2 text-right text-[10px] text-slate-600">
                          {isDel || (!isAdd && line.oldLineNumber) ? line.oldLineNumber : ''}
                        </span>
                        <span className="w-4 select-none text-center text-rose-400">
                          {isDel ? '-' : ''}
                        </span>
                        <pre className="flex-1 overflow-x-auto px-1 py-0.5 whitespace-pre font-mono">
                          {isDel || (!isAdd && line.content) ? line.content : ''}
                        </pre>
                      </div>

                      {/* Right side: New / Added */}
                      <div
                        className={`flex items-stretch ${
                          isAdd ? 'bg-emerald-950/30 text-emerald-300' : isDel ? 'bg-slate-950/40' : 'text-slate-300'
                        }`}
                      >
                        <span className="w-8 select-none pr-2 text-right text-[10px] text-slate-600">
                          {isAdd || (!isDel && line.newLineNumber) ? line.newLineNumber : ''}
                        </span>
                        <span className="w-4 select-none text-center text-emerald-400">
                          {isAdd ? '+' : ''}
                        </span>
                        <pre className="flex-1 overflow-x-auto px-1 py-0.5 whitespace-pre font-mono">
                          {isAdd || (!isDel && line.content) ? line.content : ''}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
