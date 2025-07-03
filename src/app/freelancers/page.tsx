"use client";

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function FreelancersPage() {
  const { user, role } = useAuth();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("freelancer_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFreelancers(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load freelancers."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHireRequest = async (freelancer: any) => {
    if (!user || role !== "hirer") {
      alert("You must be logged in as a hirer to send a hire request.");
      return;
    }

    setNotificationStatus((prev) => ({
      ...prev,
      [freelancer.id]: "Sending...",
    }));

    try {
      const { error } = await supabase.from("notifications").insert([
        {
          recipient_user_id: freelancer.user_id,
          sender_user_id: user.id,
          type: "hire",
          related_job_or_profile_id: freelancer.id,
          data: {
            hirer_name: user.user_metadata?.name || "Anonymous Hirer",
            hirer_email: user.email || "Not available",
            hirer_mobile: user.user_metadata?.mobile || "Not available",
            message: `I'm interested in hiring you for your ${freelancer.skill_title} skills.`,
          },
        },
      ]);

      if (error) throw error;

      setNotificationStatus((prev) => ({ ...prev, [freelancer.id]: "Sent!" }));
      setTimeout(() => {
        setNotificationStatus((prev) => ({ ...prev, [freelancer.id]: "" }));
      }, 3000);
    } catch (err) {
      console.error("Error sending hire request:", err);
      setNotificationStatus((prev) => ({
        ...prev,
        [freelancer.id]: "Failed to send. Try again.",
      }));
      setTimeout(() => {
        setNotificationStatus((prev) => ({ ...prev, [freelancer.id]: "" }));
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Freelancers
          </h2>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading freelancers...</p>
            </div>
          ) : freelancers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freelancers.map((freelancer) => (
                <div
                  key={freelancer.id}
                  className="bg-white shadow overflow-hidden sm:rounded-lg p-5"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {freelancer.skill_title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {freelancer.description}
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-500">
                      Freelancer: Anonymous
                    </p>
                    <p className="text-sm text-gray-500">
                      Experience: {freelancer.experience} years
                    </p>
                    <p className="text-sm text-gray-500">
                      Location: {freelancer.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      Availability: {freelancer.availability}
                    </p>
                  </div>
                  {user && role === "hirer" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleHireRequest(freelancer)}
                        disabled={!!notificationStatus[freelancer.id]}
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {notificationStatus[freelancer.id] || "Hire"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No freelancers available at the moment.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
