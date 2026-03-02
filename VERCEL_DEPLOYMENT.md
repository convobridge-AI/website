# Vercel Deployment & Production Setup

## ✅ Pre-Deployment Checklist

### Backend Configuration
- [ ] MongoDB Atlas cluster created and verified
- [ ] Connection string tested locally
- [ ] All TypeScript compiles without errors
- [ ] Environment variables documented in `.env.example`
- [ ] Error handling covers all edge cases
- [ ] Database indexes created
- [ ] Password hashing working correctly

### Frontend Configuration
- [ ] All API calls use `apiClient`
- [ ] Loading states implemented
- [ ] Error handling with user-friendly messages
- [ ] Toast notifications configured
- [ ] Protected routes set up
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors/warnings

### Security
- [ ] No API keys committed to git
- [ ] JWT secret is strong (32+ characters)
- [ ] MongoDB connection uses Atlas (not local)
- [ ] CORS origin matches Vercel domain
- [ ] Passwords are hashed with bcryptjs
- [ ] Environment variables are in Vercel (not `.env`)
- [ ] No sensitive data in client-side code

### Testing
- [ ] Signup/login flow works end-to-end
- [ ] Agent CRUD operations tested
- [ ] Call logging tested
- [ ] Contact form submission tested
- [ ] Dashboard loads with real data
- [ ] Pagination works
- [ ] Error states display correctly
- [ ] Mobile responsive verified

## 🚀 Vercel Deployment Steps

### 1. Repository Setup
```bash
git add .
git commit -m "Complete backend with MongoDB integration"
git push origin main
```

### 2. Create Vercel Project

Go to https://vercel.com/new and:
- Select your GitHub account
- Import `convobridge-design-journey` repository
- Framework preset: Vite (auto-detected)
- Root directory: `./`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### 3. Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_API_BASE_URL=https://your-project.vercel.app/api
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/convobridge
JWT_SECRET=your_super_secret_32_char_key
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app
```

> ⚠️ These must be set for both **Production** and **Preview** environments

### 4. Deploy

Click "Deploy" - Vercel will:
1. Clone your repository
2. Install dependencies
3. Run `npm run build`
4. Deploy static files to CDN
5. Create API routes from `/api` directory
6. Provide a `.vercel.app` domain

**Typical deployment time:** 2-5 minutes

### 5. Verify Deployment

```bash
# Test health endpoint
curl https://your-project.vercel.app/api/health

# Should respond with:
# {"status": "ok", "timestamp": "2025-11-24T..."}
```

## 📊 Environment Variables Reference

### Frontend (Vite - exposed to browser)
Must start with `VITE_` prefix:

```env
VITE_GEMINI_API_KEY=sk-proj-xxx...
VITE_API_BASE_URL=https://your-vercel-domain/api
```

### Backend (Node.js - server-only)
No `VITE_` prefix, kept private:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=random_32_character_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-vercel-domain
PORT=3001
```

### Development (.env.local - local only)
```env
# Frontend
VITE_GEMINI_API_KEY=your_key
VITE_API_BASE_URL=http://localhost:3001/api

# Backend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=dev-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## 🔧 Vercel-Specific Configuration

### Serverless Function Limits
- **Timeout:** 30 seconds (Pro: 900 seconds)
- **Memory:** 3GB
- **Request size:** 4.5MB
- **Response size:** 6MB

### Database Connection Pooling
Our MongoDB config is already optimized:
```typescript
const opts = {
  maxPoolSize: 1,                    // Vercel limit
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### Build Optimization
- TypeScript compiled to JavaScript
- Tree-shaking removes unused code
- CSS is minified
- Images are optimized by Vercel
- Typical bundle: 300-400KB gzipped

## 🐛 Troubleshooting Vercel Deployment

### Build Fails
```
Check Vercel Logs → Deployments → [your deployment] → View Function Logs
```

Common issues:
- Missing environment variables
- TypeScript compilation errors
- Incorrect import paths
- Missing dependencies in `package.json`

**Solution:**
```bash
npm run build    # Test build locally first
npm run lint     # Check for errors
```

### API Returns 404
- Verify routes exist in `api/routes/`
- Check routes are imported in `api/index.ts`
- Verify environment variables are set
- Check CORS origin matches

### MongoDB Connection Fails
```javascript
// Test in browser console:
fetch('https://your-domain/api/health').then(r => r.json()).then(console.log)
```

Issues:
- Connection string is wrong
- IP whitelist doesn't include Vercel
- Credentials are invalid

**MongoDB Atlas IP Whitelist:**
1. Go to Network Access
2. Add IP 0.0.0.0/0 (allows all)
3. Or add Vercel IPs (65.108.*.* ranges)

### CORS Errors in Frontend
```
Access to XMLHttpRequest blocked by CORS policy
```

**Check:**
1. `FRONTEND_URL` matches your Vercel domain
2. CORS middleware in `api/index.ts` has correct origin
3. Request headers include `Authorization: Bearer {token}`

### Token Expiration Issues
- Tokens expire after 7 days
- Frontend must re-login or implement refresh tokens
- Check JWT_SECRET is same in all environments

## 📈 Monitoring & Analytics

### Vercel Metrics Dashboard
- Go to Vercel Project → Analytics
- Monitor API response times
- Track error rates
- View build performance

### MongoDB Atlas Monitoring
- Go to Clusters → Performance Advisor
- Monitor connection count
- Track query performance
- Set up alerts for failures

### Application Error Monitoring (Optional)
```bash
npm install @sentry/react
```

Add to `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔐 Production Security Checklist

- [ ] **No hardcoded secrets** in code or `.env`
- [ ] **HTTPS enforced** (Vercel default)
- [ ] **CORS configured** for your domain only
- [ ] **Rate limiting** on login endpoint (optional)
- [ ] **Input validation** on all endpoints
- [ ] **SQL injection prevention** (not applicable to MongoDB)
- [ ] **XSS prevention** via React's built-in escaping
- [ ] **CSRF protection** via JWT (not session cookies)
- [ ] **Password requirements** enforced (minimum 6 chars, ideally 8+)
- [ ] **Secure headers** configured (done by Vercel)
- [ ] **Error messages** don't leak sensitive info
- [ ] **Logging** doesn't include passwords/tokens

## 📱 Performance Optimization

### Frontend
- Lazy load routes with React Router
- Code splitting automatic via Vite
- Image optimization with WebP
- CSS purged of unused classes

### Backend
- Database indexes on userId, agentId
- Pagination on list endpoints
- Connection pooling (maxPoolSize: 1)
- Gzip compression enabled by Vercel

### Database
- Keep collections under 10MB initially
- Archive old calls after 1 year
- Use MongoDB TTL indexes for temporary data

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:** Dependencies not installed
```bash
npm install
npm run build
```

### Issue: "MONGODB_URI is not set"
**Solution:** Missing environment variable
- Go to Vercel Settings → Environment Variables
- Add `MONGODB_URI=your_connection_string`
- Redeploy: `vercel --prod`

### Issue: Frontend gets 401 on every request
**Solution:** Token not being sent or is invalid
```javascript
// Check token is saved:
localStorage.getItem('authToken')
// Check Authorization header:
fetch('/api/agents', {
  headers: { 'Authorization': 'Bearer ' + token }
})
```

### Issue: Calls to `/api/...` return 404
**Solution:** API isn't deployed as serverless function
- Verify `api/` folder exists
- Check `api/index.ts` exports Express app
- Check routes are imported in `api/index.ts`
- Redeploy: `vercel --prod --force`

## 📞 Getting Help

**Issues:**
- Vercel: https://vercel.com/support
- MongoDB: https://docs.mongodb.com/atlas/
- Express: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/docs/

**Rate Limits:**
- Vercel: 100 requests/min per IP (Pro plan: unlimited)
- MongoDB Free Tier: 512MB storage

## 🎉 Post-Deployment

### First Steps
1. [ ] Test signup at `https://your-domain/login` (create account)
2. [ ] Login and verify redirect to dashboard
3. [ ] Create an agent from dashboard
4. [ ] Log a test call
5. [ ] View call history
6. [ ] Test contact form submission

### Monitoring Setup
1. [ ] Set up Vercel alerts for function errors
2. [ ] Monitor MongoDB connection pool
3. [ ] Set up email alerts for critical errors
4. [ ] Configure uptime monitoring (UptimeRobot.com)

### Maintenance
- [ ] Review error logs weekly
- [ ] Check database size monthly
- [ ] Test backup/restore procedures
- [ ] Update dependencies quarterly

---

## Quick Commands

```bash
# Deploy to production
git push origin main  # Vercel auto-deploys

# Force redeploy
vercel --prod

# Check deployment logs
vercel logs [function-name]

# Local production build test
npm run build
npm run preview

# Test API locally
npm run dev:all
curl http://localhost:3001/api/health
```

---

**Deployment Date:** [Add date when deployed]
**Last Updated:** November 24, 2025
**Status:** ✅ Ready for production
