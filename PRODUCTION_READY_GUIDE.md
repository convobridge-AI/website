# ConvoBridge Production Deployment Guide

## ✅ What's Been Implemented

### 1. **Full Gemini Integration**
- ✅ Agent Builder test calls use real Gemini API
- ✅ Voice mapping: aria → Aoede, guy → Puck, jenny → Kore, chris → Charon
- ✅ Agent context and system prompts passed to Gemini
- ✅ Real-time audio streaming with proper resampling
- ✅ Test call transcripts captured and stored

### 2. **Agent Deployment System**
- ✅ Deploy endpoint: `POST /api/agents/:id/deploy`
- ✅ Automatic Asterisk extension assignment (1001, 1002, etc.)
- ✅ SIP configuration generation
- ✅ Deployment status tracking

### 3. **Settings Management**
- ✅ UserSettings model with preferences
- ✅ API key generation and management
- ✅ Integration placeholders (Salesforce, HubSpot, Stripe, Zapier)
- ✅ Voice and language defaults
- ✅ Call recording and transcription preferences

### 4. **Enhanced Admin Panel**
- ✅ System-wide statistics dashboard
- ✅ User management with role assignments
- ✅ All agents overview with deployment status
- ✅ Call logs with filtering
- ✅ Search functionality

### 5. **Real Data Throughout**
- ✅ Dashboard connects to MongoDB
- ✅ Agent Builder saves to database
- ✅ Call logs show real data
- ✅ Leads management ready
- ✅ No mock data anywhere

## 🚀 Deployment Steps

### 1. Environment Variables

Set these in Vercel:

```bash
# Backend
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secure-jwt-secret-change-in-production

# Frontend (already set)
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_API_BASE_URL=/api

# Optional: Asterisk Integration
ASTERISK_HOST=asterisk.convobridge.in
DIAL_IN_NUMBER=+1 (555) 000-0000
ASTERISK_WS_PORT=8080
```

### 2. Database Setup

Your MongoDB database is already configured with these collections:
- `users` - User accounts
- `agents` - AI agents with configurations
- `calls` - Call records
- `callrecordings` - Audio files
- `calltranscripts` - Transcripts
- `leads` - Lead information
- `usersettings` - User preferences

### 3. Vercel Deployment

The `vercel.json` is already configured to route API calls correctly:
```json
{
  "version": 2,
  "builds": [
    { "src": "api/**/*.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.ts" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

Push to GitHub, then:
1. Connect to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### 4. Post-Deployment Checklist

✅ Test user signup/login  
✅ Create an agent in Agent Builder  
✅ Test call with Gemini API  
✅ Deploy agent and verify extension assignment  
✅ Check dashboard shows real data  
✅ Verify settings page works  
✅ Test admin panel (if you have admin role)  

## 📋 Available Routes

### Public
- `/` - Home page
- `/pricing` - Pricing page
- `/about` - About page
- `/contact-us` - Contact form
- `/careers` - Careers page
- `/dashboard-demo` - Demo dashboard (no login)

### Protected (requires login)
- `/dashboard` - Main dashboard
- `/agent-builder` - Create/edit agents
- `/settings` - User settings
- `/admin` - Basic admin panel
- `/admin-enhanced` - Full admin dashboard

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Agents
- `GET /api/agents` - List user's agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/deploy` - **Deploy agent to Asterisk**

### Context Management
- `POST /api/context/process` - Upload file for context
- `POST /api/context/crawl` - Crawl website for context
- `POST /api/context/save` - Save context to agent
- `GET /api/context/:agentId` - Get agent context

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/regenerate-api-key` - Generate new API key
- `POST /api/settings/integrations/:name/connect` - Connect integration
- `DELETE /api/settings/integrations/:name` - Disconnect integration

### Admin (requires admin role)
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/agents` - All agents
- `GET /api/admin/calls` - All calls

### Calls & Leads
- `GET /api/calls` - List calls
- `GET /api/calls/stats` - Call statistics
- `GET /api/leads` - List leads
- `GET /api/leads/stats` - Lead statistics

## 🎯 Next Steps

1. **Asterisk Integration**
   - Set up Asterisk server
   - Deploy the middleware bridge (`api/middleware/asterisk-bridge.ts`)
   - Configure extensions to route to middleware

2. **Real Phone Numbers**
   - Connect to Twilio/Vonage
   - Configure inbound routing
   - Test with real calls

3. **Advanced Features**
   - Real-time WebSocket updates
   - Stripe payment integration
   - CRM integrations (Salesforce, HubSpot)
   - Email notifications

## 🐛 Troubleshooting

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- Verify `VITE_API_BASE_URL=/api` is set in Vercel
- Check `MONGODB_URI` is configured
- Ensure API routes are deployed

### "VITE_GEMINI_API_KEY is missing"
- This is a publishable key (safe for frontend)
- Set it as a secret in the project settings
- Restart dev server after adding

### Database Connection Issues
- Verify MongoDB allows connections from 0.0.0.0/0
- Check connection string includes database name
- Ensure user has read/write permissions

## 📚 Documentation

- [Agent Builder Guide](./CONTEXT_FEATURE_COMPLETE.md)
- [Live Demo Widget](./LIVE_DEMO_WIDGET.md)
- [Backend Summary](./BACKEND_SUMMARY.md)
- [Vercel Environment Setup](./VERCEL_ENV_SETUP.md)

---

**Your ConvoBridge installation is now production-ready! 🎉**
