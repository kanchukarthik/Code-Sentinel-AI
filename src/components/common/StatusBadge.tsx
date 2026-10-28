import React from 'react';
import { AgentStatus } from '../../types/agent';
import { PipelineOverallStatus } from '../../types/pipeline';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  CircleDot,
  HelpCircle,
} from 'lucide-react';

export type DisplayStatus =
  | AgentStatus
  | PipelineOverallStatus
  | 'candidate'
  | 'approved'
  | 'rejected'
  | 'rolled_back'
  | 'open'
  | 'resolved'
  | 'investigating'
  | 'patch-ready'
  | 'flaky'
  | 'dismissed';

interface StatusBadgeProps {
  status: DisplayStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Colorblind-safe config: distinct icons, border styles, and colors
  const getConfig = () => {
    switch (status) {
      case 'passed':
      case 'approved':
      case 'resolved':
        return {
          icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
          label: status === 'approved' ? 'Approved' : status === 'resolved' ? 'Resolved' : 'Passed',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600/40',
          dot: 'bg-emerald-500',
        };
      case 'running':
      case 'investigating':
        return {
          icon: <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />,
          label: status === 'investigating' ? 'Investigating' : 'Running',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-600/40 animate-pulse',
          dot: 'bg-cyan-400',
        };
      case 'failed':
      case 'rejected':
      case 'rolled_back':
        return {
          icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
          label: status === 'rolled_back' ? 'Rolled Back' : status === 'rejected' ? 'Rejected' : 'Failed',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-600/40',
          dot: 'bg-rose-500',
        };
      case 'warning':
      case 'needs_review':
      case 'open':
      case 'candidate':
      case 'patch-ready':
      case 'flaky':
        return {
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
          label:
            status === 'candidate'
              ? 'Candidate'
              : status === 'patch-ready'
              ? 'Patch Ready'
              : status === 'flaky'
              ? 'Flaky'
              : status === 'open'
              ? 'Open'
              : status === 'needs_review'
              ? 'Needs Review'
              : 'Warning',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600/40',
          dot: 'bg-amber-400',
        };
      case 'dismissed':
      case 'idle':
      default:
        return {
          icon: <CircleDot className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />,
          label: status === 'dismissed' ? 'Dismissed' : 'Idle',
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getConfig();

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-colors ${sizeClasses[size]} ${config.bg} ${className}`}
      title={`Status: ${config.label}`}
    >
      <span className="flex-shrink-0">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
