import { createClient } from '@supabase/supabase-js';

// Use environment variables or empty strings as fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if URL is provided, otherwise export a dummy object for build time
export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    updateUser: async () => ({ data: null, error: new Error('Supabase client not initialized') }),
    signOut: async () => ({ error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase client not initialized') })
  },
  from: () => ({
    select: () => ({
      order: () => ({
        then: async () => ({ data: [], error: new Error('Supabase client not initialized') })
      }),
      eq: () => ({
        single: async () => ({ data: null, error: new Error('Supabase client not initialized') }),
        then: async () => ({ data: [], error: new Error('Supabase client not initialized') })
      }),
      update: () => ({
        eq: () => ({
          then: async () => ({ data: null, error: new Error('Supabase client not initialized') })
        })
      }),
      insert: () => ({
        then: async () => ({ data: null, error: new Error('Supabase client not initialized') })
      })
    })
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} })
    })
  })
};
