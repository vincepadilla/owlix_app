-- ============================================================
-- CareerVault — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ---- DOCUMENTS TABLE ----
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('Certificate', 'Resume', 'ID', 'Other')) NOT NULL,
  file_path   TEXT NOT NULL,
  file_type   TEXT,
  size        BIGINT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access their own documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);


-- ---- JOB APPLICATIONS TABLE ----
CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users NOT NULL,
  company       TEXT NOT NULL,
  position      TEXT NOT NULL,
  date_applied  DATE NOT NULL,
  status        TEXT CHECK (status IN ('Applied', 'Interview', 'Rejected', 'Offered', 'Hired')) NOT NULL DEFAULT 'Applied',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only access their own applications
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- STORAGE SETUP
-- Do this in: Supabase Dashboard → Storage → New Bucket
-- ============================================================
-- Bucket name: documents
-- Public: NO (private bucket — uses signed URLs)
--
-- Then add these Storage RLS policies:
-- ============================================================

-- Storage: Allow authenticated users to upload to their own folder
-- (add in Dashboard → Storage → documents bucket → Policies)
--
-- INSERT policy:
--   Name: "Users can upload own documents"
--   Target roles: authenticated
--   Policy: (bucket_id = 'documents') AND (auth.uid()::text = (storage.foldername(name))[1])
--
-- SELECT policy:
--   Name: "Users can view own documents"
--   Target roles: authenticated
--   Policy: (bucket_id = 'documents') AND (auth.uid()::text = (storage.foldername(name))[1])
--
-- DELETE policy:
--   Name: "Users can delete own documents"
--   Target roles: authenticated
--   Policy: (bucket_id = 'documents') AND (auth.uid()::text = (storage.foldername(name))[1])
