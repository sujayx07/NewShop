'use client';

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, role, updateRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, role]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (role === 'hirer') {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        setJobs(data || []);
      } else if (role === 'freelancer') {
        const { data, error } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        setSkills(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = async () => {
    setLoading(true);
    setError(null);
    try {
      const newRole = role === 'freelancer' ? 'hirer' : 'freelancer';
      await updateRole(newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch role.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and listings.</p>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.user_metadata?.name || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Mobile number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.user_metadata?.mobile || 'Not provided'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Current Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <span className="capitalize">{role || 'Not set'}</span>
                    <button
                      onClick={handleRoleSwitch}
                      disabled={loading}
                      className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      {loading ? 'Switching...' : `Switch to ${role === 'freelancer' ? 'Hirer' : 'Freelancer'}`}
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {role === 'hirer' ? 'Your Posted Jobs' : 'Your Posted Skills'}
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : role === 'hirer' ? (
              jobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{job.description}</p>
                      <p className="mt-2 text-sm text-gray-500">Skills: {job.skills}</p>
                      <p className="text-sm text-gray-500">Location: {job.location}</p>
                      <p className="text-sm text-gray-500">Salary: {job.salary}</p>
                      <p className="text-sm text-gray-500">Type: {job.work_type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven't posted any jobs yet.</p>
              )
            ) : (
              skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{skill.skill_title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{skill.description}</p>
                      <p className="mt-2 text-sm text-gray-500">Experience: {skill.experience} years</p>
                      <p className="text-sm text-gray-500">Location: {skill.location}</p>
                      <p className="text-sm text-gray-500">Availability: {skill.availability}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">You haven't posted any skills yet.</p>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
