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

-- 5. TASKS TABLE (Milestone 2 - Lean MVP)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'open' NOT NULL,
  accepted_bid_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_tasks_budget_range CHECK (budget_min >= 300 AND budget_max >= budget_min),
  CONSTRAINT chk_tasks_status CHECK (status IN ('open', 'accepted', 'cancelled', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_tasker_id ON public.tasks (tasker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_zone_status ON public.tasks (zone, status, created_at DESC) WHERE status = 'open';

-- 6. BIDS TABLE (Milestone 2 - Lean MVP)
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_bids_amount CHECK (amount >= 300),
  CONSTRAINT chk_bids_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))
);

CREATE INDEX IF NOT EXISTS idx_bids_task_id ON public.bids (task_id);
CREATE INDEX IF NOT EXISTS idx_bids_buddy_id ON public.bids (buddy_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bids_unique_active ON public.bids (task_id, buddy_id) WHERE status IN ('pending', 'accepted');

-- Add foreign key constraint for accepted_bid_id now that bids table exists
DO $$ BEGIN
  ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_accepted_bid FOREIGN KEY (accepted_bid_id) REFERENCES public.bids(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- TRIGGERS & PROCEDURES
-- ====================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_bids_updated_at ON public.bids;
CREATE TRIGGER trg_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

-- Atomic Accept-Bid Stored Procedure (Prevents race conditions & rejects competing bids)
CREATE OR REPLACE FUNCTION public.fn_accept_bid(
  p_task_id UUID,
  p_bid_id UUID,
  p_tasker_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_status VARCHAR(20);
  v_bid_status VARCHAR(20);
BEGIN
  -- 1. Lock the task row to prevent race conditions
  SELECT status INTO v_task_status
  FROM public.tasks
  WHERE id = p_task_id AND tasker_id = p_tasker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found or unauthorized.';
  END IF;

  IF v_task_status != 'open' THEN
    RAISE EXCEPTION 'Task is not in open status (current: %)', v_task_status;
  END IF;

  -- 2. Lock the bid row
  SELECT status INTO v_bid_status
  FROM public.bids
  WHERE id = p_bid_id AND task_id = p_task_id
  FOR UPDATE;

  IF NOT FOUND OR v_bid_status != 'pending' THEN
    RAISE EXCEPTION 'Bid is not available for acceptance.';
  END IF;

  -- 3. Accept target bid
  UPDATE public.bids
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_bid_id;

  -- 4. Automatically reject all competing pending bids on this task
  UPDATE public.bids
  SET status = 'rejected', updated_at = NOW()
  WHERE task_id = p_task_id AND id != p_bid_id AND status = 'pending';

  -- 5. Transition task status to accepted and link accepted_bid_id
  UPDATE public.tasks
  SET status = 'accepted',
      accepted_bid_id = p_bid_id,
      updated_at = NOW()
  WHERE id = p_task_id;

  RETURN TRUE;
END;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public upsert users" ON public.users;
CREATE POLICY "Allow public upsert users" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read buddy_profiles" ON public.buddy_profiles;
CREATE POLICY "Allow public read buddy_profiles" ON public.buddy_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public upsert buddy_profiles" ON public.buddy_profiles;
CREATE POLICY "Allow public upsert buddy_profiles" ON public.buddy_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read taskers" ON public.taskers;
CREATE POLICY "Allow public read taskers" ON public.taskers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public upsert taskers" ON public.taskers;
CREATE POLICY "Allow public upsert taskers" ON public.taskers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read kyc" ON public.kyc_submissions;
CREATE POLICY "Allow public read kyc" ON public.kyc_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public upsert kyc" ON public.kyc_submissions;
CREATE POLICY "Allow public upsert kyc" ON public.kyc_submissions FOR ALL USING (true);

-- Milestone 2 Tasks RLS
DROP POLICY IF EXISTS "Allow read open tasks" ON public.tasks;
CREATE POLICY "Allow read open tasks" ON public.tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role tasks" ON public.tasks;
CREATE POLICY "Allow service role tasks" ON public.tasks TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow tasker insert tasks" ON public.tasks;
CREATE POLICY "Allow tasker insert tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = tasker_id);
DROP POLICY IF EXISTS "Allow tasker update tasks" ON public.tasks;
CREATE POLICY "Allow tasker update tasks" ON public.tasks FOR UPDATE USING (auth.uid() = tasker_id);

-- Milestone 2 Bids RLS (Competitive Privacy Enforced)
DROP POLICY IF EXISTS "Allow service role bids" ON public.bids;
CREATE POLICY "Allow service role bids" ON public.bids TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow tasker read task bids" ON public.bids;
CREATE POLICY "Allow tasker read task bids" ON public.bids FOR SELECT USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = bids.task_id AND tasker_id = auth.uid()));
DROP POLICY IF EXISTS "Allow buddy read own bids" ON public.bids;
CREATE POLICY "Allow buddy read own bids" ON public.bids FOR SELECT USING (buddy_id = auth.uid());
DROP POLICY IF EXISTS "Allow buddy insert bids" ON public.bids;
CREATE POLICY "Allow buddy insert bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = buddy_id);
DROP POLICY IF EXISTS "Allow buddy update own bids" ON public.bids;
CREATE POLICY "Allow buddy update own bids" ON public.bids FOR UPDATE USING (auth.uid() = buddy_id);
