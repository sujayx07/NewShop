'use client';

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Subscribe to real-time notifications
      const subscription = supabase
        .channel(`notifications:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_user_id=eq.${user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_user_id', user?.id)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Please sign in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Mark all as read
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white shadow overflow-hidden sm:rounded-lg p-4 ${
                    notification.is_read ? 'opacity-75' : 'border-l-4 border-indigo-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        {notification.type === 'application'
                          ? 'Job Application'
                          : 'Hire Request'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.type === 'application'
                          ? `${notification.data.freelancer_name || 'Someone'} applied for your "${
                              notification.data.job_title
                            }" position.`
                          : `${notification.data.hirer_name || 'Someone'} is interested in hiring you for your "${
                              notification.data.message.split('for your ')[1].split(' skills')[0]
                            }" skills.`}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {notification.type === 'application' ? (
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>Applicant: {notification.data.freelancer_name || 'Anonymous'}</p>
                          <p>Email: {notification.data.freelancer_email || 'Not available'}</p>
                          <p>Mobile: {notification.data.freelancer_mobile || 'Not available'}</p>
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>Hirer: {notification.data.hirer_name || 'Anonymous'}</p>
                          <p>Email: {notification.data.hirer_email || 'Not available'}</p>
                          <p>Mobile: {notification.data.hirer_mobile || 'Not available'}</p>
                          <p>Message: {notification.data.message}</p>
                        </div>
                      )}
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-500"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No notifications yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
