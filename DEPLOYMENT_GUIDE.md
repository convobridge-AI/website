# 🚀 Multi-Tenant Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Supabase PostgreSQL database accessible
- [ ] 3 phone numbers (DIDs) ready: `+914902474600`, `+914902474601`, `+914902474602`
- [ ] Asterisk server configured to route all 3 DIDs to Stasis app
- [ ] Node.js updated code tested locally
- [ ] Frontend authentication configured with Supabase

---

## 🗄️ Step 1: Run Database Migration

### Option A: Via Supabase Dashboard (Recommended)
1. Log into your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `astrisk_live/migrations/001_multi_tenant_setup.sql`
4. Paste and click **Run**
5. Verify output shows no errors

### Option B: Via psql Command Line
```bash
cd astrisk_live/migrations
psql postgresql://[user]:[password]@[host]:5432/[database] < 001_multi_tenant_setup.sql
```

### Verify Migration Success
Run these queries in Supabase SQL Editor:

```sql
-- Check companies (should return 3 rows)
SELECT id, name, slug, credit_balance FROM companies;

-- Check phone numbers (should return 3 rows)
SELECT pn.phone_number, c.name as company 
FROM phone_numbers pn 
JOIN companies c ON c.id = pn.company_id;

-- Check AI prompts (should return 3 rows)
SELECT c.name, LEFT(cp.prompt_text, 80) as prompt_preview 
FROM company_prompts cp 
JOIN companies c ON c.id = cp.company_id;
```

**Expected Output:**
```
Nilgiri College | nilgiri-college | 1000.00
KSRTC          | ksrtc          | 2000.00
SM Soft        | sm-soft        | 1500.00
```

---

## 🔧 Step 2: Update Asterisk Server Code

### 2.1 Deploy Updated Files
```bash
cd astrisk_live

# Backup existing files
cp db.js db.js.backup
cp asterisk.js asterisk.js.backup
cp gemini.js gemini.js.backup

# Files already updated in your repo:
# - db.js (added getCompanyByPhoneNumber)
# - asterisk.js (extracts dialedNumber)
# - gemini.js (loads company-specific prompts)
```

### 2.2 Restart Asterisk Node Server
```bash
# Stop existing process
pm2 stop convobridge  # or kill the process

# Start with updated code
pm2 start index.js --name convobridge

# Monitor logs
pm2 logs convobridge
```

### 2.3 Verify DID Logging
Make a test call to any of the 3 numbers and check:
```bash
tail -f active_dids.log
```

You should see:
```
[2026-03-11T10:30:00.000Z] CALLER: 09876543210 | DIALED DID: 00914902474600
```

---

## 🎨 Step 3: Update Frontend Authentication

### 3.1 Enable Row Level Security (Already done in migration)
✅ RLS policies ensure users only see their company's data

### 3.2 Update Signup Flow
Edit `src/contexts/AuthContext.tsx`:

```typescript
// Add company selection to signup form
signup: async (email: string, password: string, name: string, companySlug: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  
  if (error) throw error;
  
  // Get company ID by slug
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', companySlug)
    .single();
  
  if (!company) throw new Error('Invalid company');
  
  // Create user profile
  await supabase.from('user_profiles').insert({
    id: data.user!.id,
    company_id: company.id,
    full_name: name,
    role: 'user'
  });
}
```

### 3.3 Create Initial Admin Users
Run these directly in Supabase:

```sql
-- Nilgiri College Admin
-- First signup via UI with email: admin@nilgiricollege.edu
-- Then link to company:
INSERT INTO user_profiles (id, company_id, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@nilgiricollege.edu'),
  (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
  'Nilgiri Admin',
  'admin'
);

-- KSRTC Admin
INSERT INTO user_profiles (id, company_id, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ksrtc.in'),
  (SELECT id FROM companies WHERE slug = 'ksrtc'),
  'KSRTC Admin',
  'admin'
);

-- SM Soft Admin
INSERT INTO user_profiles (id, company_id, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@smsoft.com'),
  (SELECT id FROM companies WHERE slug = 'sm-soft'),
  'SM Soft Admin',
  'admin'
);
```

---

## 🧪 Step 4: Test Each Company

### Test Case 1: Nilgiri College
1. **Call** `+914902474600` from any phone
2. **Expected AI Response:** "You are an AI admission counselor for Nilgiri College..."
3. **Check Dashboard:**
   - Login as `admin@nilgiricollege.edu`
   - Should see only Nilgiri College calls/leads
   - Verify call logged with correct company_id

### Test Case 2: KSRTC
1. **Call** `+914902474601`
2. **Expected AI Response:** "You are an AI customer support agent for KSRTC..."
3. **Check Dashboard:**
   - Login as `admin@ksrtc.in`
   - Should see only KSRTC calls/leads

### Test Case 3: SM Soft
1. **Call** `+914902474602`
2. **Expected AI Response:** "You are an AI sales and support agent for SM Soft..."
3. **Check Dashboard:**
   - Login as `admin@smsoft.com`
   - Should see only SM Soft calls/leads

### Verify Data Isolation
```sql
-- Should return calls only for the logged-in user's company
SELECT c.id, c.caller_number, co.name as company 
FROM calls c 
JOIN companies co ON co.id = c.company_id 
ORDER BY c.started_at DESC 
LIMIT 10;
```

---

## 📊 Step 5: Monitor & Verify

### Check Active DIDs Log
```bash
tail -f astrisk_live/active_dids.log
```

### Check Database Activity
```sql
-- Recent calls by company
SELECT co.name, COUNT(*) as call_count, SUM(c.cost) as total_cost
FROM calls c
JOIN companies co ON co.id = c.company_id
WHERE c.started_at > NOW() - INTERVAL '1 day'
GROUP BY co.name;

-- Leads by company
SELECT co.name, COUNT(*) as leads_count
FROM leads l
JOIN companies co ON co.id = l.company_id
WHERE l.created_at > NOW() - INTERVAL '1 day'
GROUP BY co.name;
```

### Check Node Server Logs
```bash
pm2 logs convobridge | grep "🏢 Routed to company"
```

You should see:
```
[Gemini] 🏢 Routed to company: Nilgiri College (ID: 1)
[Gemini] 🏢 Routed to company: KSRTC (ID: 2)
[Gemini] 🏢 Routed to company: SM Soft (ID: 3)
```

---

## 🛡️ Security Verification

### Test RLS Policies
```sql
-- Login as Nilgiri College user in Supabase
-- Run this query (should return only Nilgiri calls):
SELECT * FROM calls;

-- Attempt to access another company's data (should return 0 rows):
SELECT * FROM calls WHERE company_id = 2;  -- KSRTC
```

### Test API Isolation
```bash
# Try to fetch KSRTC calls while logged in as Nilgiri user
# Should return empty array or permission denied
```

---

## 🎯 Post-Deployment Tasks

### 1. Create Additional Users
For each company, create dashboard users:
```sql
-- Example: Add viewer for Nilgiri College
INSERT INTO user_profiles (id, company_id, full_name, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'viewer@nilgiricollege.edu'),
  (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
  'John Doe',
  'viewer'
);
```

### 2. Customize AI Prompts
```sql
-- Update KSRTC prompt with specific routes
UPDATE company_prompts 
SET prompt_text = 'Your updated prompt with specific routes...'
WHERE company_id = (SELECT id FROM companies WHERE slug = 'ksrtc');
```

### 3. Add More Phone Numbers
```sql
-- Add backup DID for Nilgiri College
INSERT INTO phone_numbers (phone_number, company_id, description)
VALUES (
  '00914902474610',
  (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
  'Secondary admission line'
);
```

### 4. Setup Billing Alerts
```sql
-- Create function to alert on low balance
CREATE OR REPLACE FUNCTION check_low_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.credit_balance < NEW.min_balance THEN
    -- Send notification (implement your notification logic)
    RAISE NOTICE 'Low balance alert for company %', NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER low_balance_alert
AFTER UPDATE OF credit_balance ON companies
FOR EACH ROW
EXECUTE FUNCTION check_low_balance();
```

---

## 🐛 Troubleshooting

### Issue: Wrong AI prompt is used
**Solution:**
```sql
-- Check which prompt is active
SELECT c.name, cp.is_active, LEFT(cp.prompt_text, 50)
FROM company_prompts cp
JOIN companies c ON c.id = cp.company_id;

-- Deactivate incorrect prompt
UPDATE company_prompts SET is_active = FALSE WHERE id = X;
```

### Issue: Calls not routing to correct company
**Solution:**
```bash
# Check DID mapping
SELECT * FROM phone_numbers WHERE phone_number = '00914902474600';

# Check active_dids.log to verify Asterisk is passing correct DID
tail -n 50 active_dids.log

# Verify dialedNumber in Node logs
pm2 logs | grep "Dialed DID"
```

### Issue: User can see other companies' data
**Solution:**
```sql
-- Verify user profile exists
SELECT * FROM user_profiles WHERE id = 'user-uuid-here';

-- Re-enable RLS if accidentally disabled
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

### Issue: AI not responding after tool call
**Already fixed in gemini.js with gating logic**
Monitor logs for:
```
[Gemini] 🛑 Audio Gated for channel: Buffering caller speech...
[Gemini] 🌊 FLUSHING: Sending N buffered frames to AI
[Gemini] ▶️ Audio Stream Resumed
```

---

## 📈 Scaling Beyond 3 Companies

To add more clients:

```sql
-- 1. Create company
INSERT INTO companies (name, slug, credit_balance, rate_per_minute)
VALUES ('New Client', 'new-client', 1000.00, 0.05);

-- 2. Assign phone number
INSERT INTO phone_numbers (phone_number, company_id, description)
VALUES ('00914902474603', (SELECT id FROM companies WHERE slug = 'new-client'), 'Main line');

-- 3. Create AI prompt
INSERT INTO company_prompts (company_id, prompt_type, prompt_text, is_active)
VALUES (
  (SELECT id FROM companies WHERE slug = 'new-client'),
  'system',
  'Your AI prompt here...',
  TRUE
);

-- 4. Create admin user via signup + insert into user_profiles
```

---

## ✅ Final Checklist

- [ ] Migration ran successfully (3 companies created)
- [ ] Phone numbers mapped correctly
- [ ] AI prompts loaded for each company
- [ ] Node server restarted with updated code
- [ ] Test calls made to all 3 DIDs
- [ ] Dashboard shows isolated data per company
- [ ] RLS policies verified
- [ ] Admin users created for each company
- [ ] Monitoring logs show correct routing

---

## 🎉 Success Criteria

✅ Call to `+914902474600` → Nilgiri College AI + logged to Nilgiri company  
✅ Call to `+914902474601` → KSRTC AI + logged to KSRTC company  
✅ Call to `+914902474602` → SM Soft AI + logged to SM Soft company  
✅ Nilgiri admin sees only Nilgiri data in dashboard  
✅ KSRTC admin sees only KSRTC data in dashboard  
✅ SM Soft admin sees only SM Soft data in dashboard  
✅ Credit deductions isolated per company  
✅ Lead capture works for all companies

**Your ConvoBridge platform is now multi-tenant ready! 🚀**
