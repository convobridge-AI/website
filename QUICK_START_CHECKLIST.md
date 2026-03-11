# ✅ Multi-Tenant Quick Start Checklist

## 🎯 Goal
Scale ConvoBridge to serve 3 independent clients:
- **Nilgiri College** (Education)
- **KSRTC** (Transportation)
- **SM Soft** (Software Development)

---

## 📋 Task List

### Phase 1: Database Setup (15 minutes)
- [ ] **1.1** Open Supabase SQL Editor
- [ ] **1.2** Run `migrations/001_multi_tenant_setup.sql`
- [ ] **1.3** Verify 3 companies created:
  ```sql
  SELECT name, slug FROM companies;
  ```
- [ ] **1.4** Verify phone number mappings:
  ```sql
  SELECT phone_number, company_id FROM phone_numbers;
  ```
- [ ] **1.5** Verify AI prompts created:
  ```sql
  SELECT COUNT(*) FROM company_prompts;  -- Should return 3
  ```

### Phase 2: Backend Updates (10 minutes)
- [ ] **2.1** Files already updated in repo:
  - `astrisk_live/db.js` ✅
  - `astrisk_live/asterisk.js` ✅
  - `astrisk_live/gemini.js` ✅
- [ ] **2.2** SSH into Asterisk server
- [ ] **2.3** Pull latest code from git
- [ ] **2.4** Restart Node.js server:
  ```bash
  pm2 restart convobridge
  ```
- [ ] **2.5** Verify logs show DID routing:
  ```bash
  pm2 logs | grep "Routed to company"
  ```

### Phase 3: Test Calls (20 minutes)
- [ ] **3.1** Call `+914902474600` (Nilgiri College)
  - [ ] AI mentions "Nilgiri College"
  - [ ] Ask about courses, AI provides education info
  - [ ] Give your name and course interest
  - [ ] Verify call logged in database
- [ ] **3.2** Call `+914902474601` (KSRTC)
  - [ ] AI mentions "KSRTC"
  - [ ] Ask about bus routes
  - [ ] Verify call logged in database
- [ ] **3.3** Call `+914902474602` (SM Soft)
  - [ ] AI mentions "SM Soft"
  - [ ] Ask about software services
  - [ ] Verify call logged in database

### Phase 4: Frontend Setup (15 minutes)
- [ ] **4.1** Create admin user for Nilgiri College:
  - [ ] Signup at your frontend with email: `admin@nilgiricollege.edu`
  - [ ] In Supabase, run:
    ```sql
    INSERT INTO user_profiles (id, company_id, full_name, role)
    VALUES (
      (SELECT id FROM auth.users WHERE email = 'admin@nilgiricollege.edu'),
      (SELECT id FROM companies WHERE slug = 'nilgiri-college'),
      'Nilgiri Admin',
      'admin'
    );
    ```
- [ ] **4.2** Create admin user for KSRTC (repeat 4.1 with `admin@ksrtc.in`)
- [ ] **4.3** Create admin user for SM Soft (repeat 4.1 with `admin@smsoft.com`)
- [ ] **4.4** Login as each admin, verify dashboard shows only their company's data

### Phase 5: Data Isolation Verification (10 minutes)
- [ ] **5.1** Login as Nilgiri admin
  - [ ] Dashboard shows only Nilgiri calls
  - [ ] Leads tab shows only Nilgiri leads
  - [ ] Stats show only Nilgiri metrics
- [ ] **5.2** Login as KSRTC admin
  - [ ] Dashboard shows only KSRTC data
- [ ] **5.3** Login as SM Soft admin
  - [ ] Dashboard shows only SM Soft data
- [ ] **5.4** Verify RLS in Supabase:
  ```sql
  -- As authenticated user, should only see your company
  SELECT * FROM calls;
  ```

### Phase 6: Production Readiness (Optional, 15 minutes)
- [ ] **6.1** Add credit top-up functionality
- [ ] **6.2** Create billing alerts for low balance
- [ ] **6.3** Add credit balance monitoring
- [ ] **6.4** Setup automated call recordings backup
- [ ] **6.5** Configure email notifications for new leads
- [ ] **6.6** Add analytics dashboard for super admin

---

## 🚨 Troubleshooting Quick Fixes

### Problem: Wrong AI prompt is used
```sql
-- Check active prompts
SELECT c.name, cp.is_active FROM company_prompts cp JOIN companies c ON c.id = cp.company_id;

-- Fix: Ensure only one active prompt per company
UPDATE company_prompts SET is_active = FALSE WHERE id = X;
UPDATE company_prompts SET is_active = TRUE WHERE id = Y;
```

### Problem: User sees other company's data
```sql
-- Check user profile
SELECT * FROM user_profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- Fix: Link user to correct company
UPDATE user_profiles SET company_id = X WHERE id = 'uuid';
```

### Problem: Calls not routing correctly
```bash
# Check DID logs
tail -50 astrisk_live/active_dids.log

# Check phone number mapping
SELECT * FROM phone_numbers WHERE phone_number = '00914902474600';
```

---

## 📊 Success Metrics

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Companies Created | 3 | `SELECT COUNT(*) FROM companies;` |
| DIDs Mapped | 3 | `SELECT COUNT(*) FROM phone_numbers;` |
| AI Prompts Active | 3 | `SELECT COUNT(*) FROM company_prompts WHERE is_active = TRUE;` |
| Test Calls Successful | 3 | Check call logs for each DID |
| Dashboard Isolation | ✅ | Login as each admin, verify data isolation |
| RLS Policies Active | 6+ | Check Supabase → Authentication → Policies |

---

## 🎉 Completion Criteria

You're done when:
1. ✅ All 3 companies exist in database
2. ✅ Each DID routes to correct company
3. ✅ Each company uses its own AI prompt
4. ✅ Test calls work for all 3 numbers
5. ✅ Dashboard admins see only their company's data
6. ✅ Calls and leads are logged with correct company_id
7. ✅ Credits deduct from correct company

---

## 📞 Support

If you encounter issues:
1. Check `DEPLOYMENT_GUIDE.md` for detailed steps
2. Review `ARCHITECTURE_DIAGRAM.md` for system overview
3. Read `MULTI_TENANT_SCALING_PLAN.md` for implementation details

---

## 🚀 Next Steps After Deployment

1. **Add more DIDs**: Just insert into `phone_numbers` table
2. **Customize prompts**: Update `company_prompts` table
3. **Create more users**: Signup + insert into `user_profiles`
4. **Top-up credits**: Insert into `topups` and update `companies.credit_balance`
5. **Monitor usage**: Query `calls` and `leads` tables with company filters

**Estimated Total Time: 1-2 hours for complete deployment** 🎯
