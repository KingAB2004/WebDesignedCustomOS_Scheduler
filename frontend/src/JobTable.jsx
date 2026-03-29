import { useState } from 'react';

export default function JobTable({ jobs }) {
  const [currentPage, setCurrentPage] = useState(1);  // which Page of Pagination
  const jobsPerPage = 5;

  const totalPages = Math.ceil(jobs.length / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob); // slice the jobs to get the Jobs we want

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const getStatusBadge = (status) => { // shows their current State
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 rounded text-xs font-bold">PENDING</span>;
      case 'RUNNING': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-1 rounded text-xs font-bold flex items-center gap-2 w-max"><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>RUNNING</span>;
      case 'COMPLETED': return <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 rounded text-xs font-bold">COMPLETED</span>;
      case 'FAILED': return <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 rounded text-xs font-bold">FAILED</span>;
      default: return <span>{status}</span>;
    }
  };


  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-xl font-bold text-white">Task Report</h2>
      </div>
      
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Job ID</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Related Info</th>
              <th className="p-4 font-medium">Delay</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {currentJobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 italic">No tasks scheduled yet.</td>
              </tr>
            ) : (
              currentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-4 font-mono text-slate-300">{job.id}</td>
                  <td className="p-4 font-semibold text-white">{job.type.replace('_', ' ')}</td>
                  <td className="p-4 text-slate-400 truncate max-w-[200px]">
                    {job.payload ? (JSON.parse(job.payload).url || JSON.parse(job.payload).to || JSON.parse(job.payload).duration_seconds || JSON.parse(job.payload).file_path || JSON.parse(job.payload).save_path || JSON.parse(job.payload).target_folder || JSON.parse(job.payload).process_name || "System") : "N/A"}
                  </td>
                  <td className="p-4 font-medium text-slate-300">
                    {job.delaySeconds > 0 ? <span className="text-orange-400">{job.delaySeconds}s</span> : <span className="text-emerald-400">Immediate</span>}
                  </td>
                  <td className="p-4">
                    {job.priority === 1 ? 'High' : job.priority === 2 ? 'Medium' : 'Low'}
                  </td>
                  <td className="p-4">{getStatusBadge(job.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-900/50 border-t border-slate-700 p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{jobs.length === 0 ? 0 : indexOfFirstJob + 1}</span> to <span className="font-semibold text-white">{Math.min(indexOfLastJob, jobs.length)}</span> of <span className="font-semibold text-white">{jobs.length}</span> tasks
        </span>
        
        <div className="flex space-x-2">
          <button 
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 border border-slate-700 text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <button 
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}