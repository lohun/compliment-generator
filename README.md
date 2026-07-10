# The Grand Praiser — AI Compliment Generator

> "Over-the-top, slightly unhinged compliments at your service."

A theatrical AI-powered application that generates wildly enthusiastic, multi-angle compliments using Google Gemini. Users submit personal details and receive three uniquely styled flattery compliments (Mythic, Scientific, Hype-Friend). Each compliment can be escalated uncapped times, copied to clipboard, and saved to session history.

---

## 🎭 Features

- **3-Angle Compliment Generation** — Each set produces three distinct compliments from different comedic personas (Mythic/legendary, Scientific/absurdist, Hype-Friend/unhinged)
- **Uncapped Escalation** — Infinitely escalate any compliment to make it more dramatic and elaborate
- **Session-Based History** — Anonymous user tracking via UUID cookie; revisit past compliment sets
- **Copy to Clipboard** — One-click copy with fallback for unsupported browsers
- **Rate Limiting** — 2 generations per session per hour (configurable)
- **Profanity & Injection Protection** — Server-side filtering + Gemini system prompt safeguards
- **Theatrical UI** — Wine-red curtain transitions, dramatic loading states, responsive design
- **Error Resilience** — Graceful handling of partial results, API failures, and network issues
- **Analytics** — Fire-and-forget event logging (form submissions, generations, escalations, copies)
- **Mobile-Optimized** — Fully responsive layout for all screen sizes

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB (w/ session & analytics collections) |
| **AI** | Google Gemini 3.1 Flash Lite |
| **Animation** | GSAP 3, Tailwind transitions |
| **Language** | TypeScript (strict mode) |
| **Package Manager** | pnpm |
| **Styling** | Tailwind CSS v4 with custom theme |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (with pnpm 8+)
- **MongoDB** connection string (Atlas or local)
- **Google Gemini API key** (from [Google AI Studio](https://aistudio.google.com/apikey))

### 1. Install Dependencies

```bash
cd compliment-generator
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=compliment_generator
```

**To obtain credentials:**
- **Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/apikey), click "Get API key"
- **MongoDB URI**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), copy the connection string

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
pnpm build
pnpm start
```

---

## 📁 Project Structure

```
compliment-generator/
├── app/
│   ├── layout.tsx                      # Root layout with transition provider
│   ├── page.tsx                        # Landing page (hero, past sets teaser)
│   ├── error.tsx                       # Global error boundary
│   ├── not-found.tsx                   # 404 page
│   ├── globals.css                     # Theme, colors, animations
│   ├── form/
│   │   └── page.tsx                    # Form page (5 input fields)
│   ├── history/
│   │   └── page.tsx                    # Session history grid
│   ├── results/
│   │   ├── [setId]/
│   │   │   ├── page.tsx                # Results RSC (fetches set)
│   │   │   ├── error.tsx               # Results-specific error page
│   │   │   └── ResultsClient.tsx       # Client wrapper (escalation logic)
│   └── api/
│       ├── compliments/
│       │   ├── generate/
│       │   │   └── route.ts            # POST: Generate compliments
│       │   ├── [setId]/
│       │   │   ├── route.ts            # GET: Fetch a set
│       │   │   └── escalate/
│       │   │       └── route.ts        # POST: Escalate a compliment
│       ├── history/
│       │   └── route.ts                # GET: Fetch session history
│       └── analytics/
│           └── event/
│               └── route.ts            # POST: Log events (fire-and-forget)
├── components/
│   ├── form/
│   │   ├── ComplimentForm.tsx          # Form with validation
│   │   ├── ComplimentCard.tsx          # Single compliment display
│   │   ├── EscalationHistory.tsx       # Collapsible thread viewer
│   │   └── GenerationLoader.tsx        # In-page loading state
│   └── transitions/
│       ├── TransitionContext.tsx       # Global transition state
│       ├── TransitionLayer.tsx         # GSAP curtain animation
│       ├── TransitionLink.tsx          # Link wrapper for transitions
│       ├── usePageReadiness.ts         # Hook for page load readiness
│       └── usePageReadiness.ts
├── lib/
│   ├── session.ts                      # Session ID management
│   ├── db/
│   │   ├── mongodb.ts                  # MongoDB connection
│   │   ├── complimentSets.ts           # Compliment set CRUD
│   │   └── analytics.ts                # Analytics event logging
│   └── gemini/
│       ├── client.ts                   # Gemini model initialization
│       └── prompts.ts                  # System instructions & user prompts
├── public/                             # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README_PROJECT.md                   # This file
```

---

## 📖 How to Use

### 1. **Landing Page** (`/`)
- Hero title: "The Grand Praiser"
- Two CTAs: "Compliment Me" or "Go Unhinged"
- Past sessions teaser (bento grid of sample compliments)

### 2. **Form Page** (`/form`)
Fill out 5 fields:
- **Full Moniker** — Your name
- **Vocation & Role** — Your job title
- **Territory of Origin** — Your location
- **Gourmet Indulgence** — Your favorite meal
- **A Singularity of Spirit** — One unique thing about you

Submit → Curtain closes → Loading transition to results page

### 3. **Results Page** (`/results/[setId]`)
Displays **three compliment cards**:
- **Mythic Card** — God-like, legendary framing
- **Scientific Card** — Mock-clinical, absurdist language
- **Hype-Friend Card** — ALL-CAPS enthusiasm, best-friend energy

**Actions per card:**
- **Escalate** — Makes the compliment more dramatic (uncapped, shows level)
- **Copy** — Copy current text to clipboard
- **History Toggle** — View all escalation levels (full thread)

**Page-level actions:**
- **Regenerate All** — Run Gemini again with same inputs
- **Start Over** — Go back to form
- **View History** — Navigate to history page
- **Input Summary** — Review what you submitted

### 4. **History Page** (`/history`)
Grid of all compliment sets from this session:
- Shows name, job, location, status
- Click any to navigate to results
- Sorted most recent first

**Pagination:** Retrieves up to 50 sets per session

---

## 🔌 API Endpoints

### POST `/api/compliments/generate`
**Generate a new compliment set**

```bash
curl -X POST http://localhost:3000/api/compliments/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "jobTitle": "Software Engineer",
    "location": "San Francisco",
    "favoriteMeal": "Sushi",
    "uniqueThing": "I speak three languages"
  }'
```

**Response** (200 OK):
```json
{
  "setId": "507f1f77bcf86cd799439011",
  "compliments": [
    {
      "complimentId": "uuid",
      "angle": "mythic",
      "thread": [
        {
          "level": 0,
          "text": "Your code is as legendary as Achilles...",
          "createdAt": "2026-07-10T12:00:00Z"
        }
      ],
      "copyCount": 0
    }
    // ... 2 more compliments
  ],
  "status": "complete"
}
```

**Error** (400/429/500):
```json
{
  "error": "You've reached your praise limit for this hour...",
  "retryable": false
}
```

---

### GET `/api/compliments/[setId]`
**Fetch a compliment set by ID**

```bash
curl http://localhost:3000/api/compliments/507f1f77bcf86cd799439011
```

**Response** (200 OK): Full `ComplimentSet` object

---

### POST `/api/compliments/[setId]/escalate`
**Escalate a single compliment**

```bash
curl -X POST http://localhost:3000/api/compliments/507f1f77bcf86cd799439011/escalate \
  -H "Content-Type: application/json" \
  -d '{"complimentId": "uuid-of-compliment"}'
```

**Response** (200 OK):
```json
{
  "complimentId": "uuid-of-compliment",
  "newEntry": {
    "level": 1,
    "text": "Your code has achieved LEGENDARY status...",
    "createdAt": "2026-07-10T12:05:00Z"
  }
}
```

---

### GET `/api/history`
**Fetch session history**

```bash
curl http://localhost:3000/api/history
```

**Response** (200 OK):
```json
{
  "sets": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionId": "uuid",
      "input": { /* form data */ },
      "compliments": [ /* array */ ],
      "status": "complete",
      "createdAt": "2026-07-10T12:00:00Z"
    }
    // ... up to 50 sets
  ]
}
```

---

## 🗄 Database Schema

### `complimentSets` Collection

```typescript
{
  _id: ObjectId,
  sessionId: string,              // UUID, indexed
  input: {
    name: string,
    jobTitle: string,
    location: string,
    favoriteMeal: string,
    uniqueThing: string
  },
  compliments: [
    {
      complimentId: string,       // UUID
      angle: "mythic" | "scientific" | "hype-friend",
      thread: [
        {
          level: number,          // 0 = original, 1+ = escalations
          text: string,           // The compliment text
          createdAt: Date
        }
      ],
      copyCount: number           // Times copied
    }
  ],
  status: "complete" | "partial" | "failed",
  createdAt: Date
}
```

### `analyticsEvents` Collection

```typescript
{
  _id: ObjectId,
  sessionId: string,
  event: "form_submitted" | "generation_success" | "generation_error" 
       | "escalate_clicked" | "escalate_success" | "escalate_error"
       | "copy_clicked" | "history_viewed",
  metadata: Record<string, any>,  // Event-specific data
  timestamp: Date
}
```

### `rateLimitGenerations` Collection

```typescript
{
  _id: ObjectId,
  sessionId: string,
  createdAt: Date  // Auto-expires after 1 hour (TTL index)
}
```

---

## 🎨 Theme & Styling

**Color Palette** (updated):
| Token | Hex | Use |
|-------|-----|-----|
| Primary | `#6d1214` | Headlines, buttons, curtains |
| Secondary | `#6c91bf` | Secondary accents |
| Accent | `#a66f43` | Escalation buttons, highlights |
| Dark Surface | `#2e4052` | Dark backgrounds, curtain panel |
| Gray | `#505a5f` | Text variants, borders |
| Background | `#fdf9f6` | App background |

**Typography:**
- **Display:** Playfair Display (serif, dramatic)
- **Body:** Inter (sans-serif, readable)

**Animations:**
- GSAP curtain split/close on navigation
- Tailwind fade-in/slide on scroll
- Loading progress counter (simulated 0→90%, snaps to 100 on response)

---

## 🚨 Error Handling

The app gracefully handles:

| Scenario | Behavior |
|----------|----------|
| Missing set ID | 404 page with "Create New Compliment" CTA |
| DB/API fetch failure | Error page with "Retry" and "Start Over" buttons |
| Partial generation | Saves 1-2 compliments, shows "retry" for missing one |
| Rate limit hit | 429 response, shows "try again later" message |
| Escalation failure | Inline error, preserves existing thread |
| Copy failure | Fallback: text selected for manual copy |
| Network error | Retry affordances, connection check message |

---

## 🔐 Security & Validation

- **Profanity Filter** — bad-words library on input fields
- **Prompt Injection Protection** — Server-side validation + Gemini system prompt
- **Rate Limiting** — MongoDB TTL index, 2 per hour per session
- **Input Validation** — Max 200 chars per field, required fields checked
- **Session Isolation** — Anonymous UUID cookie, no user accounts
- **HTTPS Ready** — Use `sameSite: "lax"` for cookie security

---

## 📊 Analytics Events

Logged events (fire-and-forget, non-blocking):

```
form_submitted          → User clicked submit on form
generation_success      → Gemini returned valid compliments
generation_error        → Gemini API failed
escalate_clicked        → User clicked escalate button
escalate_success        → Escalation thread appended
escalate_error          → Escalation failed
copy_clicked            → User clicked copy button
history_viewed          → User navigated to /history
nav_transition          → User clicked a navigation link
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (GEMINI_API_KEY, MONGODB_URI, etc.)
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

```bash
docker build -t grand-praiser .
docker run -p 3000:3000 --env-file .env.local grand-praiser
```

### Environment Variables (for deployment)

- `GEMINI_API_KEY` — Your Gemini API key
- `GEMINI_MODEL` — Model name (default: `gemini-2.5-flash`)
- `MONGODB_URI` — MongoDB connection string
- `MONGODB_DB_NAME` — Database name (default: `compliment_generator`)
- `NODE_ENV` — `production` or `development`

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Submit form with valid data → see loading → results page
- [ ] Escalate a compliment multiple times → see level increase
- [ ] Copy compliment text → verify clipboard
- [ ] Click "View History" → see past sets
- [ ] Hit rate limit → see "try again later" message
- [ ] Fill form with profanity → see error message
- [ ] Go to invalid set ID → see 404 page
- [ ] Test on mobile (iPhone, Android) → responsive layout
- [ ] Test on slow connection → loading state visible

### Load Testing

For production readiness, test with:

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/

# Monitor MongoDB indices for escalation query performance
```

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is missing"
Ensure `.env.local` has `GEMINI_API_KEY` set and the dev server is restarted.

### "Failed to connect to MongoDB"
Check `MONGODB_URI` format and that MongoDB is accessible from your network.

### Curtain animation not showing
Ensure GSAP is installed: `pnpm list gsap`. Alternatively, check browser DevTools for JS errors.

### "You've reached your praise limit"
Rate limit is 2 per hour per session. Wait 60 minutes or clear the `sessionId` cookie.

### Escalation text is the same as original
This is rare but can happen at low escalation levels. Click "Escalate Again" for more dramatic versions.

---

## 📝 License

This project is provided as-is for demonstration and educational purposes.

---

## 🎬 Credits

**Concept & Design** — The Grand Praiser theatrical experience
**AI Engine** — Google Gemini 2.5 Flash
**Frontend** — Next.js, React, Tailwind CSS, GSAP
**Database** — MongoDB
**Inspiration** — Dramatic flattery meets generative AI

---

## 🤝 Contributing

Found a bug? Have a feature request? Please open an issue or submit a PR.

**Development tips:**
- Run `pnpm lint` to check code quality
- Use `pnpm build` to test production build locally
- Check error pages: navigate to `/notfound` (will 404), or trigger DB errors in dev
- Monitor analytics in MongoDB `analyticsEvents` collection

---

## 📞 Support

For questions or issues, refer to the `IMPLEMENTATION_COMPLETE.md` and `AGENT.md` specification files in the project root for architectural details.

---

**The show goes on.** 🎭✨
