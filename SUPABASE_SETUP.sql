-- Supabase Database Setup for ConvoBridge

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles (extending auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  id_old TEXT, -- To store MongoDB ID if needed
  name TEXT,
  company TEXT,
  email TEXT,
  role TEXT DEFAULT 'user', -- Added for admin support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, company, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    NEW.email
  );

  -- Create default settings for new user
  INSERT INTO public.user_settings (user_id, api_key)
  VALUES (NEW.id, 'sk_live_' || encode(gen_random_bytes(10), 'hex'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Agents
CREATE TABLE agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('sales', 'support', 'scheduling', 'custom')) DEFAULT 'custom',
  system_prompt TEXT NOT NULL,
  generated_context TEXT DEFAULT '',
  voice TEXT DEFAULT 'alloy',
  languages TEXT[] DEFAULT ARRAY['en-US'],
  personality INTEGER DEFAULT 50,
  avatar TEXT DEFAULT '',
  integrations JSONB DEFAULT '{"salesforce": false, "hubspot": false, "stripe": false, "zapier": false}'::jsonb,
  stats JSONB DEFAULT '{"totalCalls": 0, "successRate": 0, "avgDuration": 0}'::jsonb,
  asterisk_extension TEXT UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_deployed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own agents" ON agents
  FOR ALL USING (auth.uid() = user_id);


-- 3. Calls
CREATE TABLE calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  caller_id TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed', 'missed')) DEFAULT 'initiated',
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'abandoned', 'no_answer')) DEFAULT 'no_answer',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',
  recording_id UUID, -- Placeholder
  transcript_id UUID, -- Placeholder
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calls" ON calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calls" ON calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 4. Leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  call_id UUID REFERENCES calls ON DELETE SET NULL,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT NOT NULL,
  company TEXT DEFAULT '',
  status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')) DEFAULT 'new',
  score INTEGER DEFAULT 0,
  source TEXT DEFAULT 'call',
  notes TEXT DEFAULT '',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);


-- 5. User Settings
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  api_key TEXT,
  integrations JSONB DEFAULT '{}'::jsonb,
  webhooks JSONB DEFAULT '[]'::jsonb,
  call_recording_enabled BOOLEAN DEFAULT true,
  transcription_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  default_voice TEXT DEFAULT 'aria',
  default_language TEXT DEFAULT 'en-US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- 6. Contacts
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  last_contact_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- 8. Phone Numbers (Admin)
CREATE TABLE phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  friendly_name TEXT,
  assignment_type TEXT CHECK (assignment_type IN ('agent', 'user', 'unassigned')) DEFAULT 'unassigned',
  assigned_to_id UUID, -- References profiles(id) if user, or agents(id) if agent
  provider TEXT DEFAULT 'default', -- (e.g., Twilio, Plivo, etc.)
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Only admins can manage phone numbers
CREATE POLICY "Admins can manage phone numbers" ON phone_numbers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view phone numbers assigned to them
CREATE POLICY "Users can view assigned numbers" ON phone_numbers
  FOR SELECT USING (assigned_to_id = auth.uid());

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);


-- 6. Contacts (Public)
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact request" ON contacts
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Only admins can view contact requests" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.uid() = id AND (raw_user_meta_data->>'role' = 'admin')
    )
  );
