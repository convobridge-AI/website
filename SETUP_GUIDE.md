# Live Demo Widget Setup Guide

## Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Select your Google Cloud project or create a new one
4. Copy the generated API key

### 2. Configure Environment

Create or update `.env.local` in the project root:

```bash
# .env.local
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with your real API key from step 1.

### 3. Restart Development Server

```bash
npm run dev
```

The dev server will reload automatically when `.env.local` changes.

### 4. Test the Widget

1. Open `http://localhost:8080`
2. Look for the "Live Demo Widget" section
3. Click **"Start Live Call"**
4. Allow microphone access when prompted
5. Speak naturally - the AI will respond

## Troubleshooting

### Error: "VITE_GEMINI_API_KEY is missing"

**Solution**: Add your API key to `.env.local` and restart the dev server.

```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. Verify the key is set
cat .env.local | grep VITE_GEMINI_API_KEY

# 3. Restart dev server
npm run dev
```

### Microphone Permission Denied

- Check browser settings (Settings → Privacy → Microphone)
- Test in incognito/private mode
- Clear site data: DevTools → Application → Clear Storage → Clear All
- Try a different browser

### No Audio Output

Check:
1. **Volume slider** - Ensure it's not at 0%
2. **System volume** - Check your computer/browser volume
3. **Browser speaker** - Some browsers mute by default
4. **DevTools Console** - Check for JavaScript errors

### "Connection failed" Error

- Verify API key is correct (copy from AI Studio exactly)
- Check internet connection
- Check if Gemini API is available in your region
- Try refreshing the page

### Audio Lag or Stuttering

- Close other audio applications
- Close unnecessary browser tabs
- Check network latency (F12 → Network tab)
- Reduce system load (close other programs)

## Architecture

The Live Demo Widget uses:

- **Web Audio API** - Captures microphone input, plays response audio
- **ScriptProcessorNode** - Processes audio in 4KB chunks
- **Google Gemini 2.5 Flash** - Native audio model via WebSocket
- **Audio Resampling** - Converts between browser sample rates and API requirements

### Audio Flow

```
Your Microphone
    ↓
Browser Audio Context (captures your voice)
    ↓
Resample to 16kHz (required by API)
    ↓
Gemini Live API via WebSocket
    ↓
AI Agent responds with audio
    ↓
Resample to browser sample rate
    ↓
Play through speakers (volume controlled)
```

## Environment Variable Names

Vite requires environment variables to start with `VITE_` to expose them to the browser.

| Name | Purpose | Where to Get |
|------|---------|--------------|
| `VITE_GEMINI_API_KEY` | Google Gemini API credentials | [AI Studio](https://aistudio.google.com/app/apikey) |

## Security Best Practices

### ✅ DO
- Keep API keys in `.env.local` (already in `.gitignore`)
- Rotate keys regularly
- Use separate keys for dev/prod environments
- Monitor API usage in Google Cloud Console

### ❌ DON'T
- Commit `.env.local` to git
- Share API keys in public repositories
- Use production keys in development
- Hardcode keys in source files

### Production Setup (Recommended)

For production, use a backend proxy to keep your API key secure:

```typescript
// Backend: /api/gemini-connect
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY; // Server-side only
  
  // Create a session token instead of exposing the key
  const response = await createGeminiSession(apiKey);
  return Response.json({ sessionToken: response.token });
}
```

```typescript
// Frontend: Use the session token
const token = await fetch('/api/gemini-connect').then(r => r.json());
const ai = new GoogleGenAI({ apiKey: token.sessionToken });
```

## Testing

### Manual Testing Checklist

- [ ] Widget loads without errors
- [ ] "Start Live Call" button responds to click
- [ ] Microphone permission prompt appears
- [ ] Connection status shows "Connecting..."
- [ ] Audio indicator pulses when connected
- [ ] Can hear AI response
- [ ] Volume slider adjusts audio level
- [ ] "End Call" button closes connection
- [ ] Dark mode styling works
- [ ] Mobile responsive layout works

### Browser Console

Open DevTools (F12 → Console) to see debug messages:

```javascript
// Check if API key is loaded
console.log(import.meta.env.VITE_GEMINI_API_KEY ? '✓ Key loaded' : '✗ Key missing')

// Monitor audio context
console.log('Sample Rate:', audioContext.sampleRate)

// Check connection state
console.log(connectionState)
```

## API Limits

Google Gemini API has usage limits:

- **Free tier**: 15 requests/minute, 1 million tokens/month
- **Paid tier**: Higher limits based on usage

Monitor usage:
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Generative Language API"
4. Check "Metrics" tab

## Support & Resources

- [Google Gemini API Docs](https://ai.google.dev/)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [ConvoBridge GitHub Issues](https://github.com/NIHALALT/convobridge-design-journey)

## Feedback

If you encounter issues:

1. Check this guide first
2. Search [GitHub Issues](https://github.com/NIHALALT/convobridge-design-journey/issues)
3. Create a new issue with:
   - Error message (from console)
   - Browser and OS
   - Steps to reproduce
   - Screenshot if applicable
