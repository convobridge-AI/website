# ConvoBridge Login Credentials

## ✅ Issues Fixed

### 1. RLS Blocking Data Access
**Problem**: Row Level Security policies used `auth.uid()` which returns NULL for custom PSQL authentication, blocking all queries.

**Solution**: Created Supabase RPC functions with `SECURITY DEFINER` that bypass RLS:
- `get_companies_with_stats(user_id)` - Admin panel company data
- `get_user_calls(user_id)` - User's company calls
- `get_user_agents(user_id)` - User's company agents  
- `get_user_leads(user_id)` - User's company leads
- `create_topup(company_id, amount, method, reference)` - Admin balance top-up

### 2. 500 Error on Admin Panel
**Problem**: Complex JOIN query failed due to RLS blocking access.

**Solution**: Admin panel now uses `get_companies_with_stats` RPC function that aggregates data server-side.

### 3. Login Function Permissions
**Problem**: RPC functions couldn't be called from frontend (anon key).

**Solution**: Granted EXECUTE permissions to anonymous and authenticated roles.

---

## 🔐 Login Credentials

### Platform Admin
- **Email**: `admin@convobridge.in`
- **Password**: `admin234@#$`
- **Role**: Platform admin
- **Access**: Can view all companies, manage balances, system-wide analytics

### Nilgiri College
- **Email**: `ai@nilgiricollege.ac.in` ⚠️ **Note**: `.ac.in` not `.edu`
- **Password**: `nilgiri123`
- **Role**: Company manager
- **Company ID**: 1
- **Access**: Agents, calls, leads for Nilgiri College only

### KSRTC
- **Email**: `ai@keralartc.com`
- **Password**: `ksrtc123`
- **Role**: Company manager
- **Company ID**: 3
- **Access**: Agents, calls, leads for KSRTC only

### SM Soft
- **Email**: `ai@smsoft.co.in`
- **Password**: `smsoft123`
- **Role**: Company manager
- **Company ID**: 4
- **Access**: Agents, calls, leads for SM Soft only

---

## 🧪 Testing

### Test Admin Login (SQL)
```sql
SELECT custom_login('admin@convobridge.in', 'admin234@#$');
-- Returns: {"success": true, "user": {...}}
```

### Test Company Login (SQL)
```sql
SELECT custom_login('ai@nilgiricollege.ac.in', 'nilgiri123');
-- Returns: {"success": true, "user": {...}}
```

### Test Data Fetching (SQL)
```sql
-- Get companies with stats (admin only)
SELECT * FROM get_companies_with_stats('26054832-8371-44e3-9704-c603d967a58c'::uuid);

-- Get user's calls
SELECT * FROM get_user_calls('f7af5bcd-fde5-4459-a48a-4ea420a9bacc'::uuid);
```

---

## 📝 Next Steps

1. **Deploy to Vercel**: Push this commit and redeploy
2. **Test Login**: Try logging in with correct email addresses
3. **Verify Admin Panel**: Admin should see all 3 companies with call/lead counts
4. **Verify Dashboard**: Company users should see their own data only

---

## 🔧 Environment Variables Required

Make sure these are set in Vercel:

```bash
VITE_SUPABASE_URL=https://nbnzbvchmwytgrxohobh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## ⚠️ Common Issues

### "Invalid credentials" Error
- ✅ **Check email spelling** - Use `.ac.in` for Nilgiri (not `.edu`)
- ✅ **Check password** - Passwords are case-sensitive
- ✅ **Clear browser cache** - Old failed login attempts might be cached

### Empty Dashboard
- ✅ **RLS fixed** - RPC functions now bypass RLS
- ✅ **Refresh after login** - Data should load automatically
- ✅ **Check console** - Look for any error messages

### 500 Error on Admin Panel
- ✅ **Fixed** - Now uses `get_companies_with_stats` RPC function
- ✅ **Requires admin role** - Function checks user role before returning data
