-- SQL to create necessary tables in Supabase for the freelancer and hirer portal

-- Table for Freelancer Profiles/Skills
CREATE TABLE IF NOT EXISTS freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_title TEXT NOT NULL,
  description TEXT NOT NULL,
  experience INTEGER NOT NULL,
  location TEXT NOT NULL,
  availability TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Job Postings by Hirers
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT NOT NULL,
  work_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  related_job_or_profile_id UUID,
  data JSONB NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for each table to ensure users can only access their own data
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for Row Level Security
-- Freelancer Profiles Policies
CREATE POLICY "Users can create freelancer profiles"
  ON freelancer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all freelancer profiles"
  ON freelancer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own freelancer profiles"
  ON freelancer_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own freelancer profiles"
  ON freelancer_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Job Posting Policies
CREATE POLICY "Users can create job postings"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all job postings"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own job postings"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own job postings"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Job Application Policies
CREATE POLICY "Users can apply for jobs"
  ON job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Users can view applications for their jobs"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Job owners can update application status"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_applications.job_id
      AND jobs.user_id = auth.uid()
    )
  );

-- Notification Policies
CREATE POLICY "Users can receive notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_user_id = auth.uid());

CREATE POLICY "Users can delete their notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (recipient_user_id = auth.uid());
