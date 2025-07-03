'use client';

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function HiringsPage() {
  const { user, role } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: any) => {
    if (!user || role !== 'freelancer') {
      alert('You must be logged in as a freelancer to apply for a job.');
      return;
    }

    setApplicationStatus(prev => ({ ...prev, [job.id]: 'Applying...' }));

    try {
      const { error: applicationError } = await supabase.from('job_applications').insert([
        {
          job_id: job.id,
          freelancer_id: user.id,
          message: `I'm interested in the ${job.title} position.`,
        },
      ]);

      if (applicationError) throw applicationError;

      const { error: notificationError } = await supabase.from('notifications').insert([
        {
          recipient_user_id: job.user_id,
          sender_user_id: user.id,
          type: 'application',
          related_job_or_profile_id: job.id,
          data: {
            freelancer_name: user.user_metadata?.name || "Anonymous Freelancer",
            freelancer_email: user.email || "Not available",
            freelancer_mobile: user.user_metadata?.mobile || "Not available",
            job_title: job.title,
            message: `I have applied for your ${job.title} position.`,
          },
        },
      ]);

      if (notificationError) throw notificationError;

      setApplicationStatus(prev => ({ ...prev, [job.id]: 'Applied!' }));
      setTimeout(() => {
        setApplicationStatus(prev => ({ ...prev, [job.id]: '' }));
      }, 3000);
    } catch (err) {
      console.error('Error applying for job:', err);
      setApplicationStatus(prev => ({ ...prev, [job.id]: 'Failed to apply. Try again.' }));
      setTimeout(() => {
        setApplicationStatus(prev => ({ ...prev, [job.id]: '' }));
      }, 3000);
    }
  };

  const handleViewDetails = (job: any) => {
    setSelectedJob(job);
  };

  const handleCloseDetails = () => {
    setSelectedJob(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Hirings</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading job listings...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-5">
                  <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-500">Skills: {job.skills}</p>
                    <p className="text-sm text-gray-500">Location: {job.location}</p>
                    <p className="text-sm text-gray-500">Salary: {job.salary}</p>
                    <p className="text-sm text-gray-500">Type: {job.work_type}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(job)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </button>
                    {user && role === 'freelancer' && (
                      <button
                        onClick={() => handleApply(job)}
                        disabled={!!applicationStatus[job.id]}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {applicationStatus[job.id] || 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No job listings available at the moment.</p>
          )}

          {selectedJob && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title} - Details</h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleCloseDetails}
                  >
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Description</h4>
                    <p className="text-gray-500">{selectedJob.description}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Required Skills</h4>
                    <p className="text-gray-500">{selectedJob.skills}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Location</h4>
                    <p className="text-gray-500">{selectedJob.location}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Salary</h4>
                    <p className="text-gray-500">{selectedJob.salary}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Work Type</h4>
                    <p className="text-gray-500">{selectedJob.work_type}</p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-700">Posted By</h4>
                    <p className="text-gray-500">Name: Anonymous</p>
                    <p className="text-gray-500">Email: Not available</p>
                    <p className="text-gray-500">Mobile: Not available</p>
                  </div>
                </div>
                <div className="p-4 border-t flex justify-end">
                  {user && role === 'freelancer' && (
                    <button
                      onClick={() => handleApply(selectedJob)}
                      disabled={!!applicationStatus[selectedJob.id]}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                    >
                      {applicationStatus[selectedJob.id] || 'Apply for this Job'}
                    </button>
                  )}
                  <button
                    onClick={handleCloseDetails}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
