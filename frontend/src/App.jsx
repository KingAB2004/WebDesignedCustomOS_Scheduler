import { useState, useEffect } from 'react';
import JobForm from './JobForm';
import JobTable from './JobTable';

function App() {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/jobs');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (error) {
      console.error("Could not fetch jobs from C++ API. Is the server running?", error);
    }
  };


  // doing Polling
  useEffect(() => {
    // for the first time  needed
    fetchJobs(); 
    // run every 2 sec
    const interval = setInterval(fetchJobs, 2000);
    // needed for cleanup , helpfull to prevent the polling to continue to prevent crahses
    return () => clearInterval(interval);
  }, []);

  const handleScheduleTask = async (newJobData) => {
    try {
      await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobData)
      });
      // getting jobs again to change the table
      fetchJobs();
    } catch (error) {
      console.error("Failed to reach C++ API:", error);
    }
  };

  const pendingCount = jobs.filter(j => j.status === 'PENDING').length;
  const runningCount = jobs.filter(j => j.status === 'RUNNING').length;
  const completedCount = jobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
              <header className="mb-8 border-b border-slate-800 pb-4">
            <div className="flex items-center justify-center gap-4">
          <img src="/favicon.png" alt="OS Dashboard Logo" className="h-12 w-auto"  />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            OS-Dashboard
          </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow text-center">
            <div className="text-4xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-slate-400 mt-1 text-sm font-medium uppercase tracking-wider">Pending Execution</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow text-center">
            <div className="text-4xl font-bold text-blue-400">{runningCount}</div>
            <div className="text-slate-400 mt-1 text-sm font-medium uppercase tracking-wider">Currently Running</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow text-center">
            <div className="text-4xl font-bold text-green-400">{completedCount}</div>
            <div className="text-slate-400 mt-1 text-sm font-medium uppercase tracking-wider">Tasks Completed</div>
          </div>
        </div>
        {/* Doing the JobForm and JobTable Here*/}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            {/* trnsfers the fuction to the job form to gte the data of new job */}
            <JobForm onSchedule={handleScheduleTask} /> 
          </div>
          <div className="lg:col-span-2">
            <JobTable jobs={jobs} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;