'use client';

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostJobPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [workType, setWorkType] = useState<'Remote' | 'On-Site' | 'Hybrid'>('Remote');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user || role !== 'hirer') {
        throw new Error('You must be logged in as a hirer to post a job.');
      }

      const { error } = await supabase.from('jobs').insert([
        {
          user_id: user.id,
          title,
          description,
          skills,
          location,
          salary,
          work_type: workType,
        },
      ]);

      if (error) throw error;

      alert('Job posted successfully!');
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while posting the job.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || role !== 'hirer') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">
          {user ? 'Switch to Hirer role to post a job.' : 'Please sign in as a Hirer to post a job.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Post a New Job</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Fill in the details to post a job opening.</p>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form className="px-4 py-5 sm:p-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    required
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    id="skills"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., JavaScript, React, Node.js"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    id="salary"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., $50,000 - $70,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Type</label>
                  <div className="mt-2 space-x-4 flex">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="workType"
                        value="Remote"
                        checked={workType === 'Remote'}
                        onChange={() => setWorkType('Remote')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Remote</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="workType"
                        value="On-Site"
                        checked={workType === 'On-Site'}
                        onChange={() => setWorkType('On-Site')}
                      />
                      <span className="ml-2 text-sm text-gray-700">On-Site</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="workType"
                        value="Hybrid"
                        checked={workType === 'Hybrid'}
                        onChange={() => setWorkType('Hybrid')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Hybrid</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Posting Job...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
