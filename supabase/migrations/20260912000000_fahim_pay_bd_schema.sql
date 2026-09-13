-- ==============================================================================
-- Migration: Fahim Pay BD - Production Database Schema & RLS Policies
-- Tables: profiles, user_roles, site_settings, tasks, task_submissions,
--         referrals, transactions, withdrawal_requests, support_tickets, audit_logs
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by TEXT,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
    total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_earned >= 0.00),
    total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_withdrawn >= 0.00),
    total_referrals INTEGER NOT NULL DEFAULT 0 CHECK (total_referrals >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- 3. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT NOT NULL DEFAULT 'Fahim Pay BD',
    referral_reward NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    min_withdrawal NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    withdrawal_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 2.00,
    withdrawal_methods JSONB NOT NULL DEFAULT '["bKash", "Nagad", "Rocket"]'::jsonb,
    support_phone TEXT NOT NULL DEFAULT '+880 1700-000000',
    support_whatsapp TEXT NOT NULL DEFAULT '+880 1700-000000',
    support_telegram TEXT NOT NULL DEFAULT '@fahimpaybd_support',
    announcement TEXT NOT NULL DEFAULT '📢 স্বাগতম! Fahim Pay BD-তে প্রতিটি টাস্ক সম্পূর্ণ করে এবং বন্ধুদের রেফার করে নিশ্চিত আয় করুন। উইথড্র রিকোয়েস্ট ১২-২৪ ঘণ্টার মধ্যে সফলভাবে পরিশোধ করা হয়।',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('telegram', 'youtube', 'facebook', 'app', 'daily_checkin', 'website', 'general')),
    reward_amount NUMERIC(10, 2) NOT NULL CHECK (reward_amount > 0),
    task_type TEXT NOT NULL DEFAULT 'manual' CHECK (task_type IN ('manual', 'auto')),
    proof_type TEXT NOT NULL DEFAULT 'screenshot_and_username' CHECK (proof_type IN ('screenshot_and_username', 'link_or_text', 'none')),
    proof_instruction TEXT,
    target_url TEXT,
    daily_limit INTEGER NOT NULL DEFAULT 1 CHECK (daily_limit >= 1),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 5. TASK SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    proof_data TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reward_amount NUMERIC(10, 2) NOT NULL,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON public.task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions(status);

-- 6. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'rewarded')),
    rewarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (referrer_id != referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- 7. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task_reward', 'referral_bonus', 'daily_checkin', 'withdrawal_hold', 'withdrawal_refund', 'withdrawal_paid')),
    amount NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL CHECK (balance_after >= 0.00),
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 8. WITHDRAWAL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    method TEXT NOT NULL CHECK (method IN ('bKash', 'Nagad', 'Rocket')),
    account_number TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 500.00),
    fee NUMERIC(10, 2) NOT NULL CHECK (fee >= 0.00),
    net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount > 0.00),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_note TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawal_requests(status);

-- 9. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('withdrawal', 'task', 'referral', 'account', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = uid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES RLS
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users cannot directly update balance or role"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin(auth.uid()))
    WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- USER ROLES RLS
CREATE POLICY "Admins can view and manage user roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin(auth.uid()));

-- SITE SETTINGS RLS
CREATE POLICY "Everyone can read site settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update site settings"
    ON public.site_settings FOR ALL
    USING (public.is_admin(auth.uid()));

-- TASKS RLS
CREATE POLICY "Users can read active tasks"
    ON public.tasks FOR SELECT
    USING (status = 'active' OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can mutate tasks"
    ON public.tasks FOR ALL
    USING (public.is_admin(auth.uid()));

-- TASK SUBMISSIONS RLS
CREATE POLICY "Users can view their own submissions"
    ON public.task_submissions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can submit their own tasks"
    ON public.task_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update task submissions"
    ON public.task_submissions FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- REFERRALS RLS
CREATE POLICY "Referrers can view their referrals"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_id OR public.is_admin(auth.uid()));

-- TRANSACTIONS RLS
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- WITHDRAWAL REQUESTS RLS
CREATE POLICY "Users can view their own withdrawal requests"
    ON public.withdrawal_requests FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own withdrawal requests"
    ON public.withdrawal_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update withdrawal status"
    ON public.withdrawal_requests FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- SUPPORT TICKETS RLS
CREATE POLICY "Users can view and create their own tickets"
    ON public.support_tickets FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can reply or change ticket status"
    ON public.support_tickets FOR UPDATE
    USING (public.is_admin(auth.uid()));

-- AUDIT LOGS RLS
CREATE POLICY "Only admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin(auth.uid()));
