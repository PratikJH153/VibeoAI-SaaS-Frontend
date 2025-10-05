/*
  # Video Analysis Dashboard Database Schema

  ## Overview
  This migration creates the complete database schema for a video analysis dashboard application.
  It includes tables for user profiles, projects, sessions, transcripts, sentiment analysis, notes, and reports.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User display name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last profile update

  ### 2. projects
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid, foreign key) - Project owner
  - `name` (text) - Project name
  - `client_name` (text) - Client company/person name
  - `description` (text) - Project description
  - `project_type` (text) - Type of project (e.g., user research, feedback, interview)
  - `created_at` (timestamptz) - Project creation time
  - `updated_at` (timestamptz) - Last modification time

  ### 3. sessions
  - `id` (uuid, primary key) - Unique session identifier
  - `project_id` (uuid, foreign key) - Parent project
  - `user_id` (uuid, foreign key) - Session owner
  - `title` (text) - Session title
  - `video_url` (text) - Video file URL or path
  - `duration` (integer) - Video duration in seconds
  - `status` (text) - Processing status (pending, processing, completed)
  - `created_at` (timestamptz) - Session creation time
  - `updated_at` (timestamptz) - Last modification time

  ### 4. transcripts
  - `id` (uuid, primary key) - Unique transcript identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `speaker` (text) - Speaker identifier
  - `text` (text) - Transcript text
  - `start_time` (numeric) - Start timestamp in seconds
  - `end_time` (numeric) - End timestamp in seconds
  - `confidence` (numeric) - Transcription confidence score
  - `created_at` (timestamptz) - Record creation time

  ### 5. sentiment_data
  - `id` (uuid, primary key) - Unique sentiment record identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `timestamp` (numeric) - Timestamp in video (seconds)
  - `sentiment_score` (numeric) - Sentiment score (-1 to 1)
  - `sentiment_label` (text) - Label (positive, negative, neutral)
  - `emotion` (text) - Detected emotion
  - `confidence` (numeric) - Confidence score
  - `created_at` (timestamptz) - Record creation time

  ### 6. themes
  - `id` (uuid, primary key) - Unique theme identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `theme_name` (text) - Theme/topic name
  - `mentions_count` (integer) - Number of mentions
  - `relevance_score` (numeric) - Relevance score
  - `created_at` (timestamptz) - Record creation time

  ### 7. notes
  - `id` (uuid, primary key) - Unique note identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `user_id` (uuid, foreign key) - Note author
  - `content` (jsonb) - Rich text content in JSON format
  - `tags` (text[]) - Array of tags
  - `timestamp_ref` (numeric) - Referenced video timestamp
  - `is_ai_generated` (boolean) - Flag for AI-generated content
  - `created_at` (timestamptz) - Note creation time
  - `updated_at` (timestamptz) - Last modification time

  ### 8. reports
  - `id` (uuid, primary key) - Unique report identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `user_id` (uuid, foreign key) - Report creator
  - `report_type` (text) - Type (executive, insights, conversation)
  - `title` (text) - Report title
  - `content` (jsonb) - Report content in JSON format
  - `filters` (jsonb) - Applied filters configuration
  - `created_at` (timestamptz) - Report creation time
  - `updated_at` (timestamptz) - Last modification time

  ### 9. timeline_markers
  - `id` (uuid, primary key) - Unique marker identifier
  - `session_id` (uuid, foreign key) - Parent session
  - `timestamp` (numeric) - Timestamp in video (seconds)
  - `marker_type` (text) - Type (sentiment, theme, highlight, etc.)
  - `label` (text) - Marker label/description
  - `color` (text) - Display color
  - `created_at` (timestamptz) - Marker creation time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations

  ## Indexes
  - Foreign key indexes for optimal query performance
  - Composite indexes on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  client_name text,
  description text,
  project_type text DEFAULT 'user_research',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text,
  duration integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker text NOT NULL,
  text text NOT NULL,
  start_time numeric NOT NULL,
  end_time numeric NOT NULL,
  confidence numeric DEFAULT 0.95,
  created_at timestamptz DEFAULT now()
);

-- Create sentiment_data table
CREATE TABLE IF NOT EXISTS sentiment_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  timestamp numeric NOT NULL,
  sentiment_score numeric NOT NULL,
  sentiment_label text NOT NULL,
  emotion text,
  confidence numeric DEFAULT 0.8,
  created_at timestamptz DEFAULT now()
);

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  theme_name text NOT NULL,
  mentions_count integer DEFAULT 1,
  relevance_score numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content jsonb NOT NULL DEFAULT '{}',
  tags text[] DEFAULT '{}',
  timestamp_ref numeric,
  is_ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create timeline_markers table
CREATE TABLE IF NOT EXISTS timeline_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  timestamp numeric NOT NULL,
  marker_type text NOT NULL,
  label text NOT NULL,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_markers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transcripts policies
CREATE POLICY "Users can view transcripts for own sessions"
  ON transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = transcripts.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transcripts for own sessions"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = transcripts.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transcripts for own sessions"
  ON transcripts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = transcripts.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Sentiment data policies
CREATE POLICY "Users can view sentiment data for own sessions"
  ON sentiment_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = sentiment_data.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sentiment data for own sessions"
  ON sentiment_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = sentiment_data.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Themes policies
CREATE POLICY "Users can view themes for own sessions"
  ON themes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = themes.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themes for own sessions"
  ON themes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = themes.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Timeline markers policies
CREATE POLICY "Users can view markers for own sessions"
  ON timeline_markers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = timeline_markers.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert markers for own sessions"
  ON timeline_markers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = timeline_markers.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete markers for own sessions"
  ON timeline_markers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = timeline_markers.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_session_id ON sentiment_data(session_id);
CREATE INDEX IF NOT EXISTS idx_themes_session_id ON themes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_session_id ON notes(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON reports(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_markers_session_id ON timeline_markers(session_id);