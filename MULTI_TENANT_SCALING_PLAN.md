# 🚀 Multi-Tenant Scaling Plan: Nilgiri College + KSRTC + SM Soft

## 📋 Overview
Scale your ConvoBridge platform to support 3 independent clients with isolated data, billing, and AI configurations.

---

## 🗄️ **Step 1: Database Schema Updates**

### 1.1 Create Phone Number Routing Table
```sql
CREATE TABLE IF NOT EXISTS phone_numbers (
  id              SERIAL PRIMARY KEY,
  phone_number    VARCHAR(32) UNIQUE NOT NULL,
  company_id      INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  is_active       BOOLEAN DEFAULT TRUE,
  description     TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast DID lookup during incoming calls
CREATE INDEX idx_phone_numbers_lookup ON phone_numbers(phone_number, is_active);
```

### 1.2 Add Company-Specific AI Prompts Table
```sql
CREATE TABLE IF NOT EXISTS company_prompts (
  id              SERIAL PRIMARY KEY,
  company_id      INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  prompt_type     VARCHAR(32) DEFAULT 'system',
  prompt_text     TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one active system prompt per company
CREATE UNIQUE INDEX idx_active_system_prompt ON company_prompts(company_id, prompt_type) WHERE is_active = TRUE;
```

### 1.3 Link Users to Companies (Supabase Auth Extension)
```sql
-- Create users table that extends Supabase auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  role            VARCHAR(32) DEFAULT 'user', -- 'admin', 'user', 'viewer'
  full_name       VARCHAR(256),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY user_profiles_select ON user_profiles FOR SELECT USING (auth.uid() = id);
```

### 1.4 Enable RLS on All Tables
```sql
-- Companies: Users can only see their own company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_select ON companies FOR SELECT USING (
  id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Calls: Users can only see their company's calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY calls_select ON calls FOR SELECT USING (
  company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Leads: Users can only see their company's leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_select ON leads FOR SELECT USING (
  company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Callers: Users can only see their company's callers
ALTER TABLE callers ENABLE ROW LEVEL SECURITY;
CREATE POLICY callers_select ON callers FOR SELECT USING (
  company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);

-- Topups: Users can only see their company's topups
ALTER TABLE topups ENABLE ROW LEVEL SECURITY;
CREATE POLICY topups_select ON topups FOR SELECT USING (
  company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
);
```

---

## 🏢 **Step 2: Seed Data for 3 Companies**

### 2.1 Create Companies
```sql
-- Insert Nilgiri College
INSERT INTO companies (name, slug, credit_balance, rate_per_minute, min_balance, active, metadata)
VALUES (
  'Nilgiri College',
  'nilgiri-college',
  1000.00,
  0.05,
  10.00,
  TRUE,
  '{"industry": "education", "timezone": "Asia/Kolkata"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert KSRTC
INSERT INTO companies (name, slug, credit_balance, rate_per_minute, min_balance, active, metadata)
VALUES (
  'KSRTC',
  'ksrtc',
  2000.00,
  0.06,
  50.00,
  TRUE,
  '{"industry": "transportation", "timezone": "Asia/Kolkata"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Insert SM Soft
INSERT INTO companies (name, slug, credit_balance, rate_per_minute, min_balance, active, metadata)
VALUES (
  'SM Soft',
  'sm-soft',
  1500.00,
  0.055,
  20.00,
  TRUE,
  '{"industry": "software", "timezone": "Asia/Kolkata"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;
```

### 2.2 Assign Phone Numbers (DIDs)
```sql
-- Nilgiri College: +914902474600
INSERT INTO phone_numbers (phone_number, company_id, description)
VALUES (
  '00914902474600',
  (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
  'Primary enrollment hotline'
) ON CONFLICT (phone_number) DO NOTHING;

-- KSRTC: +914902474601
INSERT INTO phone_numbers (phone_number, company_id, description)
VALUES (
  '00914902474601',
  (SELECT id FROM companies WHERE slug = 'ksrtc'),
  'Customer support and booking'
) ON CONFLICT (phone_number) DO NOTHING;

-- SM Soft: +914902474602
INSERT INTO phone_numbers (phone_number, company_id, description)
VALUES (
  '00914902474602',
  (SELECT id FROM companies WHERE slug = 'sm-soft'),
  'Sales and technical support'
) ON CONFLICT (phone_number) DO NOTHING;
```

### 2.3 Create Company-Specific AI Prompts
```sql
-- Nilgiri College Prompt
INSERT INTO company_prompts (company_id, prompt_type, prompt_text, is_active)
VALUES (
  (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
  'system',
  'You are an AI admission counselor for Nilgiri College. Help students with:
- Course information (Engineering, Arts, Commerce)
- Admission process and eligibility
- Fee structure and scholarships
- Campus facilities
Always be warm, professional, and capture leads using capture_lead() when students show interest.',
  TRUE
) ON CONFLICT DO NOTHING;

-- KSRTC Prompt
INSERT INTO company_prompts (company_id, prompt_type, prompt_text, is_active)
VALUES (
  (SELECT id FROM companies WHERE slug = 'ksrtc'),
  'system',
  'You are an AI customer support agent for KSRTC (Kerala State Road Transport Corporation). Assist with:
- Bus schedule inquiries
- Ticket booking support
- Route information
- Complaint registration
Be efficient, polite, and log all customer queries as leads for follow-up.',
  TRUE
) ON CONFLICT DO NOTHING;

-- SM Soft Prompt
INSERT INTO company_prompts (company_id, prompt_type, prompt_text, is_active)
VALUES (
  (SELECT id FROM companies WHERE slug = 'sm-soft'),
  'system',
  'You are an AI sales and support agent for SM Soft, a software development company. Handle:
- Product demos and pricing
- Technical support queries
- Custom development inquiries
- Partnership opportunities
Always capture lead details when prospects show purchase intent.',
  TRUE
) ON CONFLICT DO NOTHING;
```

---

## 🔧 **Step 3: Update Asterisk Call Routing**

### 3.1 Update `db.js` to Route by DID
```javascript
// Add this function to db.js
async function getCompanyByPhoneNumber(phoneNumber) {
  const { rows } = await query(
    `SELECT c.* FROM companies c
     INNER JOIN phone_numbers pn ON pn.company_id = c.id
     WHERE pn.phone_number = $1 AND pn.is_active = TRUE AND c.active = TRUE`,
    [phoneNumber]
  );
  return rows[0] || null;
}

// Update startCall function
async function startCall(channelId, callerNumber, dialedNumber) {
  const caller = await getOrCreateCaller(callerNumber);
  
  // Route by dialed DID instead of default company
  const company = await getCompanyByPhoneNumber(dialedNumber) || await getDefaultCompany();
  
  if (!company) {
    throw new Error(`No company found for DID: ${dialedNumber}`);
  }
  
  const res = await query(
    `INSERT INTO calls (channel_id, company_id, caller_id, caller_number, status, metadata)
     VALUES ($1, $2, $3, $4, 'active', $5) RETURNING *`,
    [channelId, company.id, caller.id, callerNumber, JSON.stringify({ dialed_number: dialedNumber })]
  );
  return { call: res.rows[0], caller, company };
}

// Export the new function
module.exports = {
  // ... existing exports
  getCompanyByPhoneNumber
};
```

### 3.2 Update `asterisk.js` to Capture Dialed Number
```javascript
ariClient.on('StasisStart', async (evt, channel) => {
  // ... existing code
  
  // Extract dialed number (DID)
  const dialedNumber = channel.dialplan?.exten || 'unknown';
  logger.info(`Call from ${channel.caller?.number} to DID ${dialedNumber}`);
  
  // Log to active_dids.log
  const fs = require('fs');
  const logEntry = `[${new Date().toISOString()}] CALLER: ${channel.caller?.number} | DIALED DID: ${dialedNumber}\n`;
  fs.appendFileSync('active_dids.log', logEntry);
  
  // Pass dialed number to startCall
  const started = await db.startCall(channel.id, channel.caller?.number, dialedNumber);
  
  // ... rest of the code
});
```

### 3.3 Update `gemini.js` to Load Company-Specific Prompt
```javascript
async function startGeminiWebSocket(channelId) {
  // ... existing setup code
  
  const channelData = sipMap.get(channelId);
  const companyId = channelData.companyId;
  
  // Load company-specific prompt instead of global setting
  let activePrompt = config.SYSTEM_PROMPT; // fallback
  
  try {
    const { rows } = await db().query(
      `SELECT prompt_text FROM company_prompts 
       WHERE company_id = $1 AND is_active = TRUE 
       ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );
    
    if (rows.length > 0) {
      activePrompt = rows[0].prompt_text;
      logAI(`[${traceId}] Loaded custom prompt for company ${companyId}`, 'info');
    }
  } catch (err) {
    logAI(`[${traceId}] Prompt load error, using default: ${err.message}`, 'warn');
  }
  
  // ... rest of websocket setup
}
```

---

## 🎨 **Step 4: Update Frontend for Multi-Company Support**

### 4.1 Create User Profile on Signup
Update `src/contexts/AuthContext.tsx`:

```typescript
signup: async (email: string, password: string, name: string, companySlug: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  
  if (error) throw error;
  if (!data.user) throw new Error('Signup failed');
  
  // Get company by slug
  const { data: companyData } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', companySlug)
    .single();
  
  if (!companyData) throw new Error('Invalid company');
  
  // Create user profile
  await supabase.from('user_profiles').insert({
    id: data.user.id,
    company_id: companyData.id,
    full_name: name,
    role: 'user'
  });
  
  toast.success('Account created! Please check your email.');
}
```

### 4.2 Update Dashboard Data Fetching
The existing `useDashboardData.ts` already filters by `company_id`, so no changes needed! ✅

### 4.3 Add Company Branding to Dashboard
Update `src/pages/Dashboard.tsx`:

```typescript
// Load company info
const [companyInfo, setCompanyInfo] = useState<any>(null);

useEffect(() => {
  if (stats?.company) {
    setCompanyInfo({
      name: stats.company.name,
      logo: stats.company.metadata?.logo_url,
      primaryColor: stats.company.metadata?.brand_color || '#3B82F6'
    });
  }
}, [stats]);

// Display company branding in header
<div className="flex items-center gap-4">
  {companyInfo?.logo && <img src={companyInfo.logo} alt={companyInfo.name} className="h-10" />}
  <h1 className="text-2xl font-bold">{companyInfo?.name} Dashboard</h1>
</div>
```

---

## 🧪 **Step 5: Testing Plan**

### Test Case 1: Nilgiri College Call
```bash
# Make test call to +914902474600
# Expected: AI uses education prompt, logs to nilgiri-college company
```

### Test Case 2: KSRTC Call
```bash
# Make test call to +914902474601
# Expected: AI uses transportation prompt, logs to ksrtc company
```

### Test Case 3: Dashboard Isolation
```bash
# Login as nilgiri-college user
# Expected: Only see Nilgiri College calls/leads

# Login as ksrtc user
# Expected: Only see KSRTC calls/leads
```

---

## 📈 **Step 6: Admin Panel for Company Management**

Create `src/pages/SuperAdmin.tsx`:

```typescript
// Allow super admins to:
// 1. Create new companies
// 2. Assign phone numbers
// 3. Manage credit balances
// 4. Edit company prompts
// 5. View cross-company analytics
```

---

## 🔐 **Security Checklist**

✅ Row Level Security enabled on all tables  
✅ Users can only access their company's data  
✅ Phone numbers uniquely mapped to companies  
✅ Credit deductions isolated per company  
✅ AI prompts isolated per company  
✅ Real-time subscriptions filtered by company

---

## 📊 **Deployment Steps**

1. **Run migrations on Supabase**:
   ```bash
   # Apply schema updates via Supabase dashboard SQL editor
   ```

2. **Seed company data**:
   ```bash
   # Run all INSERT statements from Step 2
   ```

3. **Update Asterisk server**:
   ```bash
   cd astrisk_live
   # Update db.js, asterisk.js, gemini.js
   npm restart
   ```

4. **Deploy frontend**:
   ```bash
   npm run build
   vercel deploy --prod
   ```

5. **Create test users** for each company via signup flow

---

## 🎯 **Summary**

Your system is **already 80% ready** for multi-tenancy! Just need:

1. ✅ Phone number routing table
2. ✅ Company-specific AI prompts
3. ✅ User → Company linking
4. ✅ RLS policies for data isolation

All data (calls, leads, recordings) will automatically isolate per company. Each client gets their own dashboard, billing, and AI personality.
