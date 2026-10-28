import React, { useState, useEffect, useRef } from 'react';
import { AgentLogMessage, LogLevel } from '../../types/agent';
import {
  Terminal,
  Play,
  Pause,
  Search,
  Copy,
  Check,
  Trash2,
  Filter,
  ArrowDownCircle,
} from 'lucide-react';

interface LogViewerProps {
  logs: AgentLogMessage[];
  isPaused: boolean;
  onTogglePause: (paused: boolean) => void;
  onClearLogs?: () => void;
  title?: string;
  maxHeight?: string;
  className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  isPaused,
  onTogglePause,
  onClearLogs,
  title = 'Live Agent Console Output',
  maxHeight = 'h-96',
  className = '',
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive if not paused
  useEffect(() => {
    if (!isPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel =
      filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      searchQuery.trim() === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.agentId}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'WARN':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'AGENT':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800 font-semibold';
      case 'DEBUG':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'INFO':
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    }
  };

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-800 bg-[#080c14] font-mono text-xs shadow-2xl overflow-hidden ${className}`}
    >
      {/* Terminal Titlebar & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            {title}
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Toolbar: Search, Level Filter, Pause, Copy, Clear */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Grep logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-32 md:w-44 rounded border border-slate-700/80 bg-slate-950/90 pl-7 pr-2 text-[11px] text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center rounded border border-slate-700/80 bg-slate-950/90 p-0.5 text-[10px]">
            {['ALL', 'AGENT', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded px-1.5 py-0.5 transition-colors ${
                  filterLevel === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => onTogglePause(!isPaused)}
            className={`inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] transition-colors ${
              isPaused
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
            title={isPaused ? 'Auto-scroll is paused. Click to resume' : 'Click to pause auto-scroll'}
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-cyan-400" />
                <span>Pause</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyLogs}
            className="inline-flex h-7 items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 text-[11px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Clear logs */}
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="inline-flex h-7 items-center rounded border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear output"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={logContainerRef}
        className={`${maxHeight} overflow-y-auto p-3 space-y-1 select-text bg-[#070b12]`}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-slate-600">
            <Terminal className="h-6 w-6 mb-1 opacity-40" />
            <span>No log messages match the current filter.</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 font-mono text-[11px] leading-relaxed hover:bg-slate-900/60 rounded px-1.5 py-0.5 group"
            >
              {/* Timestamp */}
              <span className="text-slate-500 flex-shrink-0 select-none">
                {log.timestamp}
              </span>

              {/* Level Badge */}
              <span
                className={`rounded border px-1 py-0.2 text-[9px] flex-shrink-0 uppercase font-mono ${getLevelBadge(
                  log.level
                )}`}
              >
                {log.level}
              </span>

              {/* Agent ID */}
              <span className="text-slate-400 flex-shrink-0 select-none">
                [{log.agentId}]
              </span>

              {/* Message Content */}
              <span
                className={`flex-1 break-all ${
                  log.level === 'ERROR'
                    ? 'text-rose-300 font-semibold'
                    : log.level === 'WARN'
                    ? 'text-amber-200'
                    : log.level === 'AGENT'
                    ? 'text-cyan-200'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}

        {/* Blinking cursor */}
        {!isPaused && (
          <div className="flex items-center gap-2 pt-1 text-cyan-400 pl-1">
            <span className="text-slate-600">&gt;</span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>

      {/* Sticky pause alert banner */}
      {isPaused && (
        <div className="flex items-center justify-between border-t border-amber-900/40 bg-amber-950/40 px-3 py-1 text-[11px] text-amber-300">
          <span className="flex items-center gap-1.5">
            <Pause className="h-3 w-3" /> Auto-scroll paused to allow inspection.
          </span>
          <button
            onClick={() => onTogglePause(false)}
            className="font-semibold underline hover:text-amber-100"
          >
            Resume live stream
          </button>
        </div>
      )}
    </div>
  );
};
