# 🏗️ Multi-Tenant Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INCOMING CALLS                                  │
└────────────┬────────────────────┬────────────────────┬──────────────────┘
             │                    │                    │
        +914902474600        +914902474601        +914902474602
             │                    │                    │
             ▼                    ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ASTERISK SERVER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  StasisStart Event                                                │  │
│  │  • channel.dialplan.exten = "00914902474600"                      │  │
│  │  • channel.caller.number = "09876543210"                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS (asterisk.js)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Extract dialedNumber (DID) and callerNumber                   │  │
│  │ 2. Log to active_dids.log                                         │  │
│  │ 3. Store in sipMap with dialedNumber field                        │  │
│  │ 4. Call startAIWebSocket(channelId)                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS (gemini.js)                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Get channelData from sipMap                                    │  │
│  │ 2. Call db.startCall(channelId, callerNumber, dialedNumber)      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (db.js)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ getCompanyByPhoneNumber(dialedNumber)                            │  │
│  │   │                                                                │  │
│  │   └──> SELECT c.* FROM companies c                                │  │
│  │        JOIN phone_numbers pn ON pn.company_id = c.id              │  │
│  │        WHERE pn.phone_number = '00914902474600'                   │  │
│  │                                                                    │  │
│  │ Returns: { id: 1, name: 'Nilgiri College', slug: 'nilgiri-...'} │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRESQL                                  │
│                                                                          │
│  ┌─────────────────────┬──────────────────┬──────────────────────────┐ │
│  │  companies          │  phone_numbers   │  company_prompts         │ │
│  ├─────────────────────┼──────────────────┼──────────────────────────┤ │
│  │ id | name           │ phone | co_id    │ co_id | prompt_text      │ │
│  ├────┼────────────────┼───────┼──────────┼───────┼──────────────────┤ │
│  │ 1  │ Nilgiri ────┬──│ 4600  │ 1        │ 1     │ "You are AI..."  │ │
│  │ 2  │ KSRTC    ───┼──│ 4601  │ 2        │ 2     │ "You are AI..."  │ │
│  │ 3  │ SM Soft  ───┼──│ 4602  │ 3        │ 3     │ "You are AI..."  │ │
│  └────┴─────────────┼──┴───────┴──────────┴───────┴──────────────────┘ │
│                     │                                                    │
│  ┌──────────────────▼─────────────────────────────────────────────────┐ │
│  │  calls                                                              │ │
│  ├────┬──────────┬────────────┬─────────────┬─────────────────────────┤ │
│  │ id │ co_id    │ caller_num │ channel_id  │ metadata                 │ │
│  ├────┼──────────┼────────────┼─────────────┼─────────────────────────┤ │
│  │ 1  │ 1 ◄──────│ 098765...  │ 1234-56...  │ {"dialed":"...4600"}    │ │
│  │ 2  │ 2 ◄──────│ 097654...  │ 1234-57...  │ {"dialed":"...4601"}    │ │
│  │ 3  │ 3 ◄──────│ 096543...  │ 1234-58...  │ {"dialed":"...4602"}    │ │
│  └────┴──────────┴────────────┴─────────────┴─────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  leads                                                            │  │
│  ├────┬──────────┬───────┬────────┬──────────────────────────────────┤  │
│  │ id │ co_id    │ name  │ phone  │ interest                         │  │
│  ├────┼──────────┼───────┼────────┼──────────────────────────────────┤  │
│  │ 1  │ 1 ◄──────│ Ram   │ 0987...│ "B.Tech Computer Science"        │  │
│  │ 2  │ 2 ◄──────│ Sita  │ 0976...│ "Bus booking issue"              │  │
│  │ 3  │ 3 ◄──────│ Kumar │ 0965...│ "Mobile app development"         │  │
│  └────┴──────────┴───────┴────────┴──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI AI                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ WebSocket Connection with Company-Specific Prompt                │  │
│  │                                                                    │  │
│  │ For Nilgiri College (DID 4600):                                   │  │
│  │ "You are an AI admission counselor for Nilgiri College..."       │  │
│  │                                                                    │  │
│  │ For KSRTC (DID 4601):                                             │  │
│  │ "You are an AI customer support agent for KSRTC..."              │  │
│  │                                                                    │  │
│  │ For SM Soft (DID 4602):                                           │  │
│  │ "You are an AI sales and support agent for SM Soft..."           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      RTP AUDIO STREAM                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ • μ-law 8kHz from Asterisk → PCM 16kHz to Gemini                 │  │
│  │ • PCM 24kHz from Gemini → μ-law 8kHz to Asterisk                 │  │
│  │ • Audio gating prevents Error 1008 during tool calls              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                        FRONTEND (React + Supabase)
═══════════════════════════════════════════════════════════════════════════

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Nilgiri College     │  │  KSRTC Dashboard     │  │  SM Soft Dashboard   │
│  Dashboard           │  │                      │  │                      │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ User:                │  │ User:                │  │ User:                │
│ admin@nilgiri...     │  │ admin@ksrtc.in       │  │ admin@smsoft.com     │
│                      │  │                      │  │                      │
│ Company ID: 1        │  │ Company ID: 2        │  │ Company ID: 3        │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ 📊 Stats             │  │ 📊 Stats             │  │ 📊 Stats             │
│ • 150 calls          │  │ • 320 calls          │  │ • 85 calls           │
│ • 42 leads           │  │ • 95 leads           │  │ • 28 leads           │
│ • ₹950 credits       │  │ • ₹1,850 credits     │  │ • ₹1,420 credits     │
│                      │  │                      │  │                      │
│ 📞 Recent Calls      │  │ 📞 Recent Calls      │  │ 📞 Recent Calls      │
│ [Only Nilgiri data]  │  │ [Only KSRTC data]    │  │ [Only SM Soft data]  │
│                      │  │                      │  │                      │
│ 🎯 Leads             │  │ 🎯 Leads             │  │ 🎯 Leads             │
│ [Only Nilgiri leads] │  │ [Only KSRTC leads]   │  │ [Only SM Soft leads] │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │   SUPABASE ROW LEVEL SECURITY │
                    ├───────────────────────────────┤
                    │ SELECT * FROM calls           │
                    │ WHERE company_id IN (         │
                    │   SELECT company_id           │
                    │   FROM user_profiles          │
                    │   WHERE id = auth.uid()       │
                    │ )                             │
                    └───────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            DATA FLOW SUMMARY
═══════════════════════════════════════════════════════════════════════════

1. Caller dials +914902474600 (Nilgiri College)
      ↓
2. Asterisk captures DID in StasisStart event
      ↓
3. Node.js logs DID to active_dids.log
      ↓
4. db.startCall() queries phone_numbers table
      ↓
5. Returns company_id = 1 (Nilgiri College)
      ↓
6. gemini.js loads company_prompts for company_id = 1
      ↓
7. AI uses Nilgiri College prompt
      ↓
8. Call, transcript, and leads saved with company_id = 1
      ↓
9. Dashboard shows data only to users with company_id = 1 (RLS)

═══════════════════════════════════════════════════════════════════════════
                         KEY SECURITY FEATURES
═══════════════════════════════════════════════════════════════════════════

✅ Phone Number Isolation
   • Each DID mapped to exactly one company
   • No cross-company call routing

✅ Database Row Level Security (RLS)
   • Users can only SELECT their company's data
   • Enforced at PostgreSQL level (not bypassable via API)

✅ Credit Balance Isolation
   • Each company has independent credit_balance
   • Deductions affect only the company that made the call

✅ AI Prompt Isolation
   • Each company has custom AI personality
   • No prompt leakage between companies

✅ Real-time Subscription Filtering
   • WebSocket subscriptions filter by company_id
   • Users receive updates only for their company

═══════════════════════════════════════════════════════════════════════════
