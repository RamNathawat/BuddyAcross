-- ====================================================================
-- BuddyAcross Canonical PostgreSQL Database Schema
-- Exactly mirrors the live Supabase database tables
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20),
  email VARCHAR(255),
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. BUDDY PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.buddy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  skills TEXT[],
  kyc_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TASKERS TABLE
CREATE TABLE IF NOT EXISTS public.taskers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. KYC SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddy_profiles(id) ON DELETE CASCADE,
  aadhaar_front TEXT NOT NULL,
  aadhaar_back TEXT NOT NULL,
  selfie TEXT NOT NULL,
  rejection_reason TEXT,
  status VARCHAR(30) DEFAULT 'pending' NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  account_holder VARCHAR(150),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  emergency_name VARCHAR(150),
  emergency_phone VARCHAR(30),
  skills TEXT[],
  zones TEXT[],
  submitted_ago VARCHAR(50) DEFAULT 'Just now'
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public upsert users" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public read buddy_profiles" ON public.buddy_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public upsert buddy_profiles" ON public.buddy_profiles FOR ALL USING (true);

CREATE POLICY "Allow public read taskers" ON public.taskers FOR SELECT USING (true);
CREATE POLICY "Allow public upsert taskers" ON public.taskers FOR ALL USING (true);

CREATE POLICY "Allow public read kyc" ON public.kyc_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public upsert kyc" ON public.kyc_submissions FOR ALL USING (true);
