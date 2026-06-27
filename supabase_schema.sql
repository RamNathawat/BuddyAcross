-- ====================================================================
-- BuddyAcross Milestone 1: Production PostgreSQL Database Schema
-- Run this script inside your Supabase SQL Editor to enable full DB sync
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Stores core user account roles and names)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'buddy' CHECK (role IN ('tasker', 'buddy', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUDDIES TABLE (Stores Buddy profile details and service skills/zones)
CREATE TABLE IF NOT EXISTS public.buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  city TEXT DEFAULT 'Bengaluru',
  state TEXT DEFAULT 'Karnataka',
  pincode TEXT DEFAULT '560001',
  skills JSONB DEFAULT '[]'::jsonb,
  zones JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected', 'resubmission_requested')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKERS TABLE (Stores Tasker profile details)
CREATE TABLE IF NOT EXISTS public.taskers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  city TEXT DEFAULT 'Bengaluru',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KYC SUBMISSIONS TABLE (Stores 7-step Aadhaar KYC & bank records)
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  buddy_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  zones JSONB DEFAULT '[]'::jsonb,
  aadhaar_front TEXT NOT NULL,
  aadhaar_back TEXT NOT NULL,
  selfie TEXT NOT NULL,
  account_holder TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  emergency_name TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmission_requested')),
  rejection_reason TEXT,
  submitted_ago TEXT DEFAULT 'Just now',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permit client apps to read and write records smoothly during onboarding
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- Create open onboarding policies for users
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public upsert users" ON public.users FOR ALL USING (true);

-- Create open onboarding policies for buddies
CREATE POLICY "Allow public read buddies" ON public.buddies FOR SELECT USING (true);
CREATE POLICY "Allow public upsert buddies" ON public.buddies FOR ALL USING (true);

-- Create open onboarding policies for taskers
CREATE POLICY "Allow public read taskers" ON public.taskers FOR SELECT USING (true);
CREATE POLICY "Allow public upsert taskers" ON public.taskers FOR ALL USING (true);

-- Create open onboarding policies for kyc submissions
CREATE POLICY "Allow public read kyc" ON public.kyc_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public upsert kyc" ON public.kyc_submissions FOR ALL USING (true);
