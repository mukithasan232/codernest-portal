'use client';

import { useState } from 'react';
import { Target, RefreshCw, Briefcase, Plus, Send, ExternalLink, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMatchingJobs, convertJobToLead, JobListing } from '@/actions/job-hunter.actions';

export default function JobHunterPage() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<{ legiit: boolean; upwork: boolean; upworkError?: string } | null>(null);

  const handleFetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetchMatchingJobs();
      if (response.success && response.jobs) {
        setJobs(response.jobs);
        setApiStatus(response.status || null);
        toast.success(`Found ${response.jobs.length} matching jobs!`);
      } else {
        toast.error(response.error || 'Failed to fetch jobs.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while fetching jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToLead = async (job: JobListing) => {
    setProcessingId(job.id);
    try {
      const response = await convertJobToLead(job);
      if (response.success) {
        toast.success(`Successfully converted "${job.clientName}" into a CRM Lead!`);
        // Optionally remove from list after conversion
        setJobs(jobs.filter(j => j.id !== job.id));
      } else {
        toast.error(response.error || 'Failed to convert to lead.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred during conversion.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendProposal = (job: JobListing) => {
    if (job.url) {
      window.open(job.url, '_blank');
    } else {
      toast.error('No direct URL available for this job.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-500" />
            Job & Client Hunter
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Automatically scout for high-ticket projects matching your tech stack across external platforms.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {apiStatus && (
            <div className="flex flex-col gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="relative flex h-2.5 w-2.5">
                  {apiStatus.legiit ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                  )}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {apiStatus.legiit ? 'Legiit API Connected' : 'Legiit Mock'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="relative flex h-2.5 w-2.5">
                  {apiStatus.upwork ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                  )}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-medium" title={apiStatus.upworkError}>
                  {apiStatus.upwork ? 'Upwork Connected' : 'Upwork Mock / Error'}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleFetchJobs}
            disabled={loading}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning Platforms...' : 'Run Manual Hunt'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No active orders/leads found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              No active jobs or leads were found on your connected accounts (e.g. Legiit). Run a manual hunt to check again.
            </p>
            <button
              onClick={handleFetchJobs}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Start Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/10">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Project Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Platform</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Budget</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Match Score</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white text-base mb-1">
                        {job.title}
                      </div>
                      <div className="text-sm text-slate-500 mb-2">{job.clientName} • Posted {job.postedTime}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {job.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top pt-5 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                      {job.budget}
                    </td>
                    <td className="px-6 py-4 align-top pt-5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${job.matchScore >= 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {job.matchScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top pt-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleConvertToLead(job)}
                          disabled={processingId === job.id}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Convert to CRM Lead"
                        >
                          {processingId === job.id ? (
                            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSendProposal(job)}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                          title="Automate Pitch / Proposal"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        <a
                          href={job.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Original Post"
                          onClick={(e) => {
                            if (!job.url) {
                              e.preventDefault();
                              toast.error('No direct URL available for this job.');
                            }
                          }}
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
