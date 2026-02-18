-- Supabase Database Migration for ConvoBridge
-- This script adds missing columns and features to your existing tables safely.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Update Profiles
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      'User'
    ),
    NEW.email,
    'user'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create default settings for new user
  INSERT INTO public.user_settings (user_id, api_key)
  VALUES (NEW.id, 'sk_live_' || encode(gen_random_bytes(10), 'hex'))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Update Agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own agents" ON public.agents;
CREATE POLICY "Users can manage their own agents" ON public.agents
  FOR ALL USING (auth.uid() = user_id);


-- 3. Update Calls
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own calls" ON public.calls;
CREATE POLICY "Users can view their own calls" ON public.calls
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own calls" ON public.calls;
CREATE POLICY "Users can create their own calls" ON public.calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. Update Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own leads" ON public.leads;
CREATE POLICY "Users can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id);


-- 5. Update User Settings
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='call_recording_enabled') THEN
    ALTER TABLE public.user_settings 
      ADD COLUMN call_recording_enabled BOOLEAN DEFAULT true,
      ADD COLUMN transcription_enabled BOOLEAN DEFAULT true,
      ADD COLUMN notifications_enabled BOOLEAN DEFAULT true,
      ADD COLUMN email_notifications BOOLEAN DEFAULT true,
      ADD COLUMN default_voice TEXT DEFAULT 'aria',
      ADD COLUMN default_language TEXT DEFAULT 'en-US';
  END IF;
END $$;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);


-- 6. Update Contacts (Public Inquiries)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a contact request" ON public.contacts;
CREATE POLICY "Anyone can submit a contact request" ON public.contacts
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Only admins can view contact requests" ON public.contacts;
CREATE POLICY "Only admins can view contact requests" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 7. New Table: Phone Numbers (Admin)
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  friendly_name TEXT,
  assignment_type TEXT CHECK (assignment_type IN ('agent', 'user', 'unassigned')) DEFAULT 'unassigned',
  assigned_to_id UUID,
  provider TEXT DEFAULT 'default',
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage phone numbers" ON public.phone_numbers;
CREATE POLICY "Admins can manage phone numbers" ON public.phone_numbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view assigned numbers" ON public.phone_numbers;
CREATE POLICY "Users can view assigned numbers" ON public.phone_numbers
  FOR SELECT USING (assigned_to_id = auth.uid());


-- 8. System Stats View
CREATE OR REPLACE VIEW public.system_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.agents) as total_agents,
  (SELECT COUNT(*) FROM public.calls) as total_calls,
  (SELECT COALESCE(SUM(duration), 0) FROM public.calls) as total_minutes;
