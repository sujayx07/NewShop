'use client';

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostSkillPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [skillTitle, setSkillTitle] = useState('');
  const [description, setDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<'Remote' | 'On-site'>('Remote');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user || role !== 'freelancer') {
        throw new Error('You must be logged in as a freelancer to post a skill.');
      }

      const { error } = await supabase.from('freelancer_profiles').insert([
        {
          user_id: user.id,
          skill_title: skillTitle,
          description,
          experience: parseInt(experience),
          location,
          availability,
        },
      ]);

      if (error) {
        console.error('Error posting skill:', error);
        throw new Error(`Failed to post skill: ${error.message}. The table 'freelancer_profiles' might not exist or you might not have permission to access it. Please ensure the table is created in Supabase with the correct schema.`);
      }

      alert('Skill posted successfully!');
      router.push('/profile');
    } catch (err) {
      console.error('Unexpected error posting skill:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while posting the skill.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || role !== 'freelancer') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">
          {user ? 'Switch to Freelancer role to post a skill.' : 'Please sign in as a Freelancer to post a skill.'}
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
              <h3 className="text-lg leading-6 font-medium text-gray-900">Post Your Skill</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Fill in the details to showcase your skills.</p>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form className="px-4 py-5 sm:p-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="skillTitle" className="block text-sm font-medium text-gray-700">
                    Skill Title
                  </label>
                  <input
                    type="text"
                    name="skillTitle"
                    id="skillTitle"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={skillTitle}
                    onChange={(e) => setSkillTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
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
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    id="experience"
                    required
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <div className="mt-2 space-x-4 flex">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="availability"
                        value="Remote"
                        checked={availability === 'Remote'}
                        onChange={() => setAvailability('Remote')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Remote</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="availability"
                        value="On-site"
                        checked={availability === 'On-site'}
                        onChange={() => setAvailability('On-site')}
                      />
                      <span className="ml-2 text-sm text-gray-700">On-site</span>
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
                  {loading ? 'Posting Skill...' : 'Post Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
