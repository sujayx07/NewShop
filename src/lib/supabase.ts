import { createClient } from '@supabase/supabase-js';

// Use environment variables or empty strings as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock channel that matches the expected interface
const createMockChannel = () => {
  const mockChannel = {
    on: function(this: any, ...args: any[]) {
      return this;
    },
    subscribe: () => ({ unsubscribe: () => {} })
  };
  return mockChannel;
};

// Create Supabase client only if URL is provided, otherwise export a dummy object for build time
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : {
  auth: {
    getSession: async () => Promise.resolve({ data: { session: null }, error: null }),
    updateUser: async () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
    signOut: async () => Promise.resolve({ error: null }),
    signUp: async () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase client not initialized') }),
    signInWithPassword: async () => Promise.resolve({ data: { session: null }, error: new Error('Supabase client not initialized') })
  },
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: new Error('Supabase client not initialized') }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
      }),
    }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
    }),
  }),
  channel: createMockChannel
} as any;
