# Multi-Tenant Admin & Login Setup Guide

## Admin User Creation

### How to Create the Admin User

**Email:** `admin@convobridge.in`  
**Password:** `admin234@#$`

#### Step 1: Create Auth User in Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your ConvoBridge project
3. Navigate to **Authentication → Users**
4. Click **Add User**
5. Enter:
   - Email: `admin@convobridge.in`
   - Password: `admin234@#$`
   - Auto confirm: ✅ Check (so user doesn't need email verification)
6. Click **Create User**

#### Step 2: Create User Profile Entry
After creating the auth user, copy the new user's **ID (UUID)** and run this SQL in your Supabase SQL editor:

```sql
-- Create super admin profile (no company_id assigned)
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES (
  'PASTE_ADMIN_USER_ID_HERE',  -- Replace with the UUID from Step 1
  NULL,                         -- NULL = super admin, can see all companies
  'admin',
  'ConvoBridge Admin'
);
```

**Verify** with:
```sql
SELECT id, company_id, role, full_name FROM user_profiles WHERE role = 'admin';
```

---

## Multi-Tenant Login Flow

### Architecture Overview

```
┌─────────────────────────────────────────┐
│      User Logs In (Email + Password)   │
├─────────────────────────────────────────┤
│ 1. Supabase Auth validates credentials │
│ 2. AuthContext fetches user_profiles   │
│ 3. Extract: company_id, role           │
│ 4. Set user context with role          │
│ 5. Route to dashboard/admin based role │
└─────────────────────────────────────────┘
```

### Login Flows by User Type

---

#### **1. ADMIN (Platform Super Admin)**

| Field | Value |
|-------|-------|
| **Email** | `admin@convobridge.in` |
| **Password** | `admin234@#$` |
| **Role** | `admin` |
| **Company ID** | `NULL` (sees all companies) |
| **Accessed Page** | `/admin` (Admin Dashboard) |

**What Admin Can Do:**
- View all 3 companies (Nilgiri College, KSRTC, SM Soft)
- Monitor all calls, leads, agents
- Add credit to any company
- Manage all user accounts
- View system analytics

**Authentication Flow:**
```typescript
// Login
await login('admin@convobridge.in', 'admin234@#$')

// AuthContext fetches from user_profiles:
// { id: 'uuid...', company_id: null, role: 'admin', full_name: 'ConvoBridge Admin' }

// Sets user context:
// { ..., company_id: null, role: 'admin', isAdmin: true, isManager: true }

// Routes to: /admin (protected by AdminRoute component)
```

---

#### **2. NILGIRI COLLEGE Employee**

| Field | Value |
|-------|-------|
| **Email** | `admin@nilgiri.edu` (example) |
| **Password** | User's password |
| **Role** | `manager` or `user` |
| **Company ID** | `1` (Nilgiri College) |
| **Accessed Page** | `/dashboard` (Company Dashboard) |

**What Nilgiri Users Can Do:**
- View only their company data
- Manage AI agents for Nilgiri
- View calls & leads for Nilgiri
- Manage DID: `00914902474600` (education counselor AI)
- Request credits (admin approves)

**Authentication Flow:**
```typescript
// Create Nilgiri Manager (via Supabase Dashboard or API)
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('uuid-nilgiri-manager', 1, 'manager', 'Nilgiri Manager');

// Login
await login('admin@nilgiri.edu', 'password123')

// AuthContext fetches:
// { id: 'uuid...', company_id: 1, role: 'manager', full_name: 'Nilgiri Manager' }

// Sets user context:
// { ..., company_id: 1, role: 'manager', isAdmin: false, isManager: true }

// Row Level Security kicks in:
// Can only see companies WHERE id = 1
// Can only see calls WHERE company_id = 1
// Can only see agents WHERE company_id = 1

// Routes to: /dashboard (protected by ProtectedRoute + RLS)
```

**RLS Policy in Database:**
```sql
-- Companies: User sees only their company
CREATE POLICY companies_select ON companies 
  FOR SELECT USING (
    id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );

-- Calls: User sees only their company's calls
CREATE POLICY calls_select ON calls 
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
  );
```

---

#### **3. KSRTC Employee**

| Field | Value |
|-------|-------|
| **Email** | `admin@ksrtc.gov.in` (example) |
| **Password** | User's password |
| **Role** | `manager` or `user` |
| **Company ID** | `3` (KSRTC) |
| **Accessed Page** | `/dashboard` (Company Dashboard) |

**How to Create KSRTC User:**

```sql
-- 1. Create auth user in Supabase Dashboard (admin@ksrtc.gov.in)
-- 2. Then create profile entry:
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('uuid-ksrtc-manager', 3, 'manager', 'KSRTC Manager');
```

**What KSRTC Users Can Do:**
- View only KSRTC company data
- AI Agent: Transport support (handles bus bookings, complaints)
- DID: `00914902474601` routes calls to KSRTC AI
- Monitor bus-related calls & leads
- Manage team members in KSRTC

---

#### **4. SM SOFT Employee**

| Field | Value |
|-------|-------|
| **Email** | `admin@smsoft.com` (example) |
| **Password** | User's password |
| **Role** | `manager` or `user` |
| **Company ID** | `4` (SM Soft) |
| **Accessed Page** | `/dashboard` (Company Dashboard) |

**How to Create SM Soft User:**

```sql
-- 1. Create auth user in Supabase Dashboard (admin@smsoft.com)
-- 2. Then create profile entry:
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('uuid-smsoft-manager', 4, 'manager', 'SM Soft Manager');
```

**What SM Soft Users Can Do:**
- View only SM Soft company data
- AI Agent: Software sales support
- DID: `00914902474602` routes calls to SM Soft AI
- Monitor sales calls & leads
- Manage software inquiry responses

---

## Login Security & Data Isolation

### Row Level Security (RLS) - Database Level

Every table has RLS policies enforced:

```sql
-- User Profiles: Can only see your own profile
SELECT * FROM user_profiles 
WHERE id = auth.uid();  -- Always filtered to current user

-- Companies: Can only see your company
SELECT * FROM companies 
WHERE id IN (
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
);

-- Calls: Can only see your company's calls
SELECT * FROM calls 
WHERE company_id IN (
  SELECT company_id FROM user_profiles WHERE id = auth.uid()
);

-- Same for: leads, agents, topups, phone_numbers, company_prompts
```

### Frontend Role Checking

```typescript
// Get current user role & company from AuthContext
const { user, isAdmin, isManager } = useAuth();

// Navigate based on role
if (isAdmin) {
  // Show admin panel with all companies
  navigate('/admin');
} else if (isManager) {
  // Show dashboard with only company data
  navigate('/dashboard');
} else {
  // Show restricted user dashboard
  navigate('/dashboard');
}
```

---

## User Creation Template

### For New Nilgiri College Employee:
```sql
-- Get UUID from Supabase Auth (after creating auth user in dashboard)
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('UUID_FROM_AUTH', 1, 'user', 'Employee Name');
```

### For New KSRTC Employee:
```sql
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('UUID_FROM_AUTH', 3, 'user', 'Employee Name');
```

### For New SM Soft Employee:
```sql
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('UUID_FROM_AUTH', 4, 'user', 'Employee Name');
```

### For New Company Manager:
```sql
INSERT INTO user_profiles (id, company_id, role, full_name)
VALUES ('UUID_FROM_AUTH', 1, 'manager', 'Manager Name');  -- Change company_id as needed
```

---

## Testing the Multi-Tenant Setup

### Test 1: Admin Login
```
1. Go to /login
2. Enter: admin@convobridge.in / admin234@#$
3. Should redirect to: /admin
4. Should see all 3 companies
```

### Test 2: Nilgiri Login
```
1. Create auth user: admin@nilgiri.edu
2. Create profile: company_id=1, role=manager
3. Go to /login
4. Enter: admin@nilgiri.edu / password
5. Should redirect to: /dashboard
6. Should ONLY see Nilgiri College data
```

### Test 3: KSRTC Login
```
1. Create auth user: admin@ksrtc.gov.in
2. Create profile: company_id=3, role=manager
3. Go to /login
4. Enter: admin@ksrtc.gov.in / password
5. Should redirect to: /dashboard
6. Should ONLY see KSRTC data
```

### Test 4: SM Soft Login
```
1. Create auth user: admin@smsoft.com
2. Create profile: company_id=4, role=manager
3. Go to /login
4. Enter: admin@smsoft.com / password
5. Should redirect to: /dashboard
6. Should ONLY see SM Soft data
```

---

## What Changed in Code

### Frontend (React)

✅ **AuthContext.tsx**
- Added `role`, `full_name` fields to User interface
- Added `isAdmin`, `isManager` computed properties
- Login now fetches user_profiles to get role/company_id

✅ **AdminRoute.tsx** (NEW)
- Mirrors ProtectedRoute but checks `isAdmin` role
- Non-admin users redirected to /dashboard

✅ **App.tsx**
- Admin routes now use `<AdminRoute>` instead of `<ProtectedRoute>`

### Backend Database (Supabase)

✅ **user_profiles table** (from migration)
- Links Supabase auth.users to companies
- Stores role: 'admin', 'manager', 'user'
- RLS ensures users only see their own profile

✅ **RLS Policies** (from migration)
- All tables filtered by company_id
- Admin (company_id=NULL) sees all
- Non-admin see only their company

---

## Summary

| User Type | Email | Role | Company | Access |
|-----------|-------|------|---------|--------|
| **Platform Admin** | `admin@convobridge.in` | admin | NULL (All) | `/admin` |
| **Nilgiri Manager** | `admin@nilgiri.edu` | manager | 1 | `/dashboard` |
| **KSRTC Manager** | `admin@ksrtc.gov.in` | manager | 3 | `/dashboard` |
| **SM Soft Manager** | `admin@smsoft.com` | manager | 4 | `/dashboard` |

Each user is **completely isolated** via RLS—they cannot see data from other companies.
