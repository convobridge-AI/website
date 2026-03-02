# Vercel Environment Variables Setup

To deploy this application on Vercel, you need to configure the following environment variables in your Vercel project settings:

## Required Environment Variables

### Backend (Server-side)
1. **MONGODB_URI** (Required)
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/convobridge`
   - Get from: MongoDB Atlas dashboard

2. **JWT_SECRET** (Required)
   - Secret key for JWT token generation
   - Example: Generate a random 64-character string
   - Command: `openssl rand -base64 64`

3. **NODE_ENV** (Optional)
   - Set to `production`

4. **FRONTEND_URL** (Optional)
   - Your production frontend URL
   - Example: `https://your-domain.vercel.app`

### Frontend (Client-side)
1. **VITE_GEMINI_API_KEY** (Required for AI features)
   - Your Google Gemini API key
   - Get from: https://makersuite.google.com/app/apikey

2. **VITE_API_BASE_URL** (Auto-configured)
   - Already set to `/api` in production
   - No need to manually configure

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select the appropriate environments (Production, Preview, Development)
5. Click **Save**

## Testing Locally

Create a `.env.local` file in the project root:

```bash
# Backend
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/convobridge
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=http://localhost:3001/api
```

## Deployment Checklist

- [ ] Set `MONGODB_URI` in Vercel environment variables
- [ ] Set `JWT_SECRET` in Vercel environment variables
- [ ] Set `VITE_GEMINI_API_KEY` in Vercel environment variables
- [ ] Configure MongoDB to allow connections from Vercel IPs (or use 0.0.0.0/0)
- [ ] Test authentication flow after deployment
- [ ] Verify API endpoints are accessible
- [ ] Check browser console for any CORS errors
- [ ] Test creating agents, calls, and leads

## Troubleshooting

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- This means the frontend is trying to connect to localhost
- Solution: Ensure `VITE_API_BASE_URL=/api` in production build
- Rebuild and redeploy after setting environment variables

### "MongoDB connection failed"
- Check if `MONGODB_URI` is correctly set in Vercel
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check MongoDB username and password are URL-encoded

### "Unauthorized" errors
- Ensure `JWT_SECRET` is set and consistent across deployments
- Clear browser localStorage and try logging in again
- Check if token is being sent in Authorization header

### API 404 errors
- Verify the `/api` rewrite rule in vercel.json
- Check if the serverless function is deployed (api/index.ts)
- Look at Vercel function logs for errors
