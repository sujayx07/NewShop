'use client';

import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to Freelance Portal
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              A platform connecting freelancers and hirers. Find talent or opportunities that match your needs.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/freelancers"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Freelancers
                </a>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a
                  href="/hirings"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Jobs
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Freelance Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
