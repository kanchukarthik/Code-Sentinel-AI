import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { usePipeline } from '../context/PipelineContext';
import {
  FolderGit2,
  UploadCloud,
  Play,
  CheckCircle2,
  Clock,
  Code2,
  GitBranch,
  FileCode,
  AlertCircle,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  source_type: string;
  source_path: string;
  default_branch: string;
  language: string;
  created_at: string;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { triggerNewRun } = usePipeline();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadName, setUploadName] = useState<string>('');
  const [uploadDesc, setUploadDesc] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch {
      // Fallback mock projects if backend is starting
      setProjects([
        {
          id: 'proj-calc-001',
          name: 'CalculatorPro (Buggy Edition)',
          description: 'High-precision scientific computation library with arithmetic, harmonic mean, and amortization algorithms.',
          source_type: 'sample',
          source_path: 'backend/data/projects/calculator_pro',
          default_branch: 'main',
          language: 'python',
          created_at: new Date().toISOString(),
        },
        {
          id: 'proj-cart-002',
          name: 'ShoppingCartCore',
          description: 'E-commerce shopping cart, promotional vouchers, discount matrix, and checkout pricing engine.',
          source_type: 'sample',
          source_path: 'backend/data/projects/shopping_cart_core',
          default_branch: 'main',
          language: 'python',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName) {
      setUploadError('Project name and a .zip file are required.');
      return;
    }
    try {
      setUploading(true);
      setUploadError(null);
      await api.uploadProjectZip(uploadName, uploadFile, uploadDesc);
      setIsUploadOpen(false);
      setUploadName('');
      setUploadDesc('');
      setUploadFile(null);
      await fetchProjects();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload project.');
    } finally {
      setUploading(false);
    }
  };

  const handleTriggerRun = async (projectId: string) => {
    try {
      setTriggeringId(projectId);
      await api.triggerRun(projectId, { trigger: 'manual', branch: 'main' });
      triggerNewRun();
      navigate('/pipeline');
    } catch {
      triggerNewRun();
      navigate('/pipeline');
    } finally {
      setTriggeringId(null);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FolderGit2 className="w-8 h-8 text-cyan-400" />
            Target Codebases & Projects
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage analyzed target codebases, upload zip archives, and dispatch multi-agent autonomous QA runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh projects"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Codebase (.zip)
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, language, or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
        </span>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No projects found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Upload your first Python codebase zip file to initiate automated test synthesis and bug discovery.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Archive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between transition-all shadow-md hover:shadow-cyan-950/20"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <GitBranch className="w-3 h-3 text-cyan-400" />
                          {project.default_branch}
                        </span>
                        <span>•</span>
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {project.language}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">ID: {project.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{project.source_path}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] shrink-0">
                    Ready
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Added {new Date(project.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleTriggerRun(project.id)}
                  disabled={triggeringId === project.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-cyan-600/20"
                >
                  {triggeringId === project.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                  Run Pipeline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                <UploadCloud className="w-6 h-6 text-cyan-400" />
                Upload Target Codebase
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Payments Gateway Microservice"
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Brief overview of functionality..."
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  ZIP Archive (.zip)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
                  <input
                    type="file"
                    required
                    accept=".zip"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Must contain Python source files and optional pytest test files.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium shadow-md shadow-cyan-600/20 transition-all"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Uploading & Extracting...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
