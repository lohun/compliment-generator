# AI Compliment Generator — Design Specification

**Stack:** Next.js (App Router) · Tailwind CSS · GSAP · MongoDB · Google Gemini
**Theme:** Wine Red
**Version:** 1.0

---

## 1. Product Summary

A user fills out a short form (name, job title, location, favourite meal, one unique thing about them). The system sends this to Gemini, which returns **three distinct, over-the-top, slightly unhinged compliments**, each written from a different comedic "angle" so they don't feel like the same joke reworded. The user can escalate any single compliment repeatedly (uncapped), each escalation building on the full history of that thread, and copy any version to their clipboard. Every generated set is saved to MongoDB, tied to an anonymous session, so users can revisit their history, and every key interaction is logged for analytics.

Navigation between pages uses a signature GSAP wine-red "curtain split" transition, driven by a `LOADING XX%` readout that represents the real load state of the destination page.

---

## 2. Site Map & Page Flow

```
/                 Landing — hero, CTA, past-session teaser
/form             The 5-field input form
/results/[setId]  The 3 compliments + escalation + copy
/history          Grid of past generated sets (this session)
```

Flow: `/` → (click "Compliment Me") → curtain-close → `/form` → (submit) → curtain-close → generation loading state happens *inside* `/results` (not a route transition) → curtain-open reveals `/results/[setId]` populated.

`/history` is reachable from the nav at any time and follows the same transition rules as any other link.

---

## 3. GSAP Page Transition System

Two **distinct** loading experiences exist in this product — do not conflate them:

| | Route Transition Loader | In-Page Generation Loader |
|---|---|---|
| Triggered by | Clicking any `<Link>` or submitting the form | Waiting on a Gemini API response |
| Visual | Full-screen wine-red curtain w/ `LOADING XX%` | Themed card-level state inside `/results` |
| % meaning | Real readiness of the destination route/data | Simulated progress, eased, capped pre-response |
| Detailed in | Section 3 | Section 7 |

### 3.1 Curtain mechanic

A persistent `<TransitionLayer />` lives in the root layout, above all route content (`z-50`), containing two full-height wine-red panels (`#4A1D23` left, `#722F37` right) plus a centered `LOADING XX%` label in the display serif.

**On first load (app boot):**
1. Panels start fully covering the viewport (meeting at center).
2. `LOADING` counts 0→100 tied to real signals: font load, critical images decoded, and the initial route's data fetch (e.g., session bootstrap). Use `requestIdleCallback`/`Promise.all` on real assets — do not fake this one.
3. At 100%, GSAP timeline splits the panels apart (`xPercent: -100` left, `xPercent: 100` right) with a slight overshoot ease (`power4.inOut`), revealing the landing page underneath, which itself fades/slides in 80ms behind the split.

**On navigation (link click or form submit) — the "reverse":**
1. Intercept navigation (App Router: wrap `<Link>`/submit handler, call `router.push` only after animation).
2. Panels animate from off-screen back to meeting at center (`xPercent: 0`), i.e., the reverse of the split. `LOADING XX%` counts up during this close.
3. Once fully closed, swap the route (Next.js navigation happens while covered).
4. Percentage keeps counting (or holds at ~90–95% if the next page's data isn't ready yet — this is where "loading 90%" most often visibly sits) until destination data resolves.
5. Panels split apart again (same easing as boot) to reveal the new page.

This gives the literal behavior requested: **split on load-complete, reverse on link click/form submit**, with the percentage representing the incoming page's real readiness — so it's common and correct for the user to see it hover at 90% while, say, a route's `getServerSideProps`/RSC fetch or a font/image is still resolving.

### 3.2 Implementation notes
- Use `useGSAP` (from `@gsap/react`) scoped to `<TransitionLayer />`.
- Track "page readiness" via a small `usePageReadiness()` hook returning a 0–100 number: weight it e.g. 40% route JS chunk loaded, 30% initial data fetch resolved, 30% hero imagery decoded. Clamp animation to never visually skip — if readiness jumps from 40→100 instantly, tween the display number over ~400ms rather than snapping.
- Never allow the panels to open before readiness hits 100 — if data is slow, hold at 90–99% (animate a slow crawl within that band so it doesn't look frozen) rather than lying and hitting 100 early.
- Respect `prefers-reduced-motion`: fall back to a simple 300ms crossfade with no counting text (just a static "Loading…").

---

## 4. Visual Theme

**Palette**
| Token | Hex | Use |
|---|---|---|
| `wine-950` | `#2B1114` | deepest bg / text on light |
| `wine-800` | `#4A1D23` | curtain panel (left), dark surfaces |
| `wine-600` | `#722F37` | primary brand, curtain panel (right), buttons |
| `wine-400` | `#9E4B54` | hover states, secondary accents |
| `blush-200` | `#E8C4C4` | soft backgrounds, card fills |
| `gold-500` | `#C9A227` | escalation button, highlights, "unhinged" accents |
| `cream-50` | `#FAF6F3` | app background |
| `ink-900` | `#1C1416` | body text |

**Typography**
- Display/headline: a dramatic serif (e.g. `"Fraunces", serif` or `"Playfair Display"`) — used for the `LOADING XX%` label, page hero titles, and compliment text itself (compliments should *look* grandiose).
- Body/UI: a clean sans (`"Inter", sans-serif`) for form labels, buttons, meta text.

**Motion personality:** velvety, theatrical, a little extra — overshoot eases, slow curtain reveals, confetti-adjacent micro-bursts on copy/escalate rather than snappy utilitarian motion.

---

## 5. Data Model (MongoDB)

Anonymous sessions: on first visit, generate a `sessionId` (UUID) client-side, store in a cookie (`httpOnly: false`, 1 year) so `/history` works across visits without login.

### `sessions`
```ts
{
  _id: ObjectId,
  sessionId: string,       // UUID, indexed, unique
  createdAt: Date,
  lastSeenAt: Date,
  userAgent: string,
}
```

### `complimentSets`
```ts
{
  _id: ObjectId,
  sessionId: string,          // indexed
  input: {
    name: string,
    jobTitle: string,
    location: string,
    favoriteMeal: string,
    uniqueThing: string,
  },
  compliments: [
    {
      complimentId: string,        // uuid, stable per "slot" across escalations
      angle: "mythic" | "scientific" | "hype-friend", // see §6
      thread: [                    // full escalation chain, index 0 = original
        {
          level: number,           // 0 = original
          text: string,
          createdAt: Date,
        }
      ],
      copyCount: number,
    }
  ],
  status: "complete" | "partial" | "failed",
  createdAt: Date,
}
```

### `analyticsEvents`
```ts
{
  _id: ObjectId,
  sessionId: string,
  event: "form_submitted" | "generation_success" | "generation_error"
       | "escalate_clicked" | "escalate_success" | "escalate_error"
       | "copy_clicked" | "history_viewed" | "nav_transition",
  metadata: Record<string, any>,   // e.g. { complimentId, level, errorMessage }
  timestamp: Date,
}
```

Analytics writes are **fire-and-forget** and must never block or fail the user-facing flow (see §9).

---

## 6. Gemini Prompt Design

### 6.1 Why naive prompting fails
Asking for "3 compliments" in one call tends to produce three compliments with the same rhetorical shape (same sentence structure, same kind of hyperbole) just with synonyms swapped. To get genuine variety, the prompt fixes **three distinct personas/angles** and asks for one compliment per angle, so the model has a different lens for each rather than "try to be different" as a vague instruction.

### 6.2 The three angles (fixed, not chosen by the model)
1. **Mythic/Legendary** — compares the person to gods, legends, historical epics; treats their job/meal/quirk as the stuff of prophecy.
2. **Absurdist/Scientific** — treats the person as a statistically impossible phenomenon; mock-clinical language, "researchers are baffled," fake statistics, deadpan escalating into ridiculous.
3. **Unhinged Hype-Friend** — reads like a best friend who's had too much coffee, ALL CAPS energy, exclamation points, treats mundane facts (their lunch order) as breaking news.

### 6.3 Generation prompt structure (initial 3)

System instruction (sent once, `systemInstruction` field):
```
You are the engine behind an "AI Compliment Generator." Given facts about a
real person, you write compliments that are over-the-top, wildly enthusiastic,
and slightly unhinged — the goal is to make them feel like the most important
person on Earth, using humor and hyperbole, never sincerity alone.

You always return exactly 3 compliments, one for each of these fixed angles,
and each must sound like a different narrator wrote it:

1. MYTHIC — legendary/godlike framing, historical/epic language.
2. SCIENTIFIC — mock-clinical, fake-statistical, deadpan-to-absurd.
3. HYPE-FRIEND — caps-lock best-friend energy, treats small facts as huge news.

Rules:
- Use the person's specific details (name, job, location, meal, unique trait) —
  do not write generic flattery that could apply to anyone.
- Each compliment is 2-4 sentences.
- Never repeat a joke, phrase, or comparison across the three.
- Keep it warm underneath the absurdity — this should make someone smile, not
  feel mocked.
- Return ONLY valid JSON matching the provided schema. No prose, no markdown.
```

User turn (per request), templated:
```
Name: {{name}}
Job title: {{jobTitle}}
Location: {{location}}
Favourite meal: {{favoriteMeal}}
Something unique about them: {{uniqueThing}}

Generate the 3 compliments now.
```

Response is forced into structured JSON via Gemini's `responseMimeType: "application/json"` + `responseSchema`:
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "angle": { "type": "string", "enum": ["mythic", "scientific", "hype-friend"] },
      "text": { "type": "string" }
    },
    "required": ["angle", "text"]
  }
}
```

### 6.4 Escalation prompt structure

Escalation must feel meaningfully bigger, not a rephrase — so the model is given the **full thread history for that one compliment** (not the other two) as real conversation turns, and is explicitly told what "bigger" means.

Request is built as a multi-turn `contents` array:
```
[
  { role: "user", parts: [{ text: originalUserFacts }] },
  { role: "model", parts: [{ text: thread[0].text }] },     // original compliment
  { role: "user", parts: [{ text: thread[1] ? "Escalate again." : "Escalate." }] },
  { role: "model", parts: [{ text: thread[1]?.text }] },    // if escalation already happened once
  ... one pair per prior escalation ...
  { role: "user", parts: [{ text: escalateInstruction }] }
]
```

`escalateInstruction` (varies slightly by level to keep pushing, not plateau):
```
Make this MORE dramatic than the previous version — same angle/persona,
same core facts, but raise the stakes: bigger comparisons, higher stated
consequences, more elaborate hyperbole. Do not just add adjectives or repeat
prior phrasing — escalate the actual claim being made. Keep the same JSON
schema, angle field unchanged, 2-4 sentences.
```

Because there's no cap, the system prompt also tells the model the escalation is happening for the Nth time (pass `level` explicitly) so very high levels are nudged toward creative reinvention rather than just louder text — e.g. at level ≥5, append: *"You're several escalations deep — feel free to go cosmic, absurdist, or genuinely surreal to keep raising the stakes."*

### 6.5 Model/config
- Model: `gemini-2.5-flash` (fast, cheap, sufficient creative range) — configurable via env var so it's swappable.
- `temperature: 1.1–1.3` for the generation and escalation calls (favors variety over safety/repetition).
- `maxOutputTokens`: modest cap (~400) — these are short by design.

---

## 7. In-Page Generation Loading State

Lives inside `/results` while awaiting the Gemini response (separate system from §3).

- Full-width themed panel, wine-red gradient background, replaces the (not-yet-existing) compliment cards.
- A `LOADING XX%` counter is reused here for visual consistency with the transition system, but it's **simulated**: ease from 0 to 90% over ~2.5s (matches typical Gemini latency), then hold at 90% ("loading 90%" is the expected resting state for real requests that take longer than the simulated curve) until the response actually arrives, then snap to 100% and cross-dissolve into the three cards.
- Below the counter, rotate one of 4–5 in-character loading lines every ~1.2s (GSAP fade), e.g.: "Consulting the ancient scrolls of flattery…", "Running the numbers on how impressive you are…", "Waking up the hype squad…" — reinforces the product's tone even while waiting, rather than a generic spinner.
- Skeleton outlines of the three cards are visible behind/around the loader so the destination layout is telegraphed.

---

## 8. Results Page & Compliment Card

Each of the 3 cards displays:
- **Angle label** (small caps chip: "Mythic" / "Scientific" / "Hype-Friend") so the variety is legible, not just felt.
- **Compliment text** in the display serif, sized to breathe (this is the hero content).
- **Escalation level indicator** — small dots or a "Level 3" tag once escalated past original, so the user can track how far a thread has gone.
- **Actions row:**
  - **Escalate** button (gold accent, flame/rocket icon) — always enabled, uncapped. Label could dynamically read "Escalate Again" after level 1. Shows a lightweight inline loading state on the button itself (not a full card reload) while the escalation call is in flight — text swaps to "Escalating…" with a subtle pulsing animation, card content stays visible/unblocked.
  - **Copy** button (icon + "Copy") — placed directly adjacent to Escalate, always visible (not hidden behind hover) so it's obvious on mobile/touch too. On click: `navigator.clipboard.writeText(currentThreadText)`, button icon morphs to a checkmark via GSAP, label swaps to "Copied!" for ~1.8s, small toast/pulse confirms it, then reverts. If Clipboard API fails (permissions/unsupported), fall back to a selected, read-only text field with an inline message: "Copy failed — text is selected, press ⌘/Ctrl+C."
  - Below the escalate/copy row, a collapsed "History" toggle reveals prior levels of that thread (read-only, each with its own small Copy) so a user can go back to an earlier version if they liked it better.

Page-level actions: "Regenerate All" (re-runs §6.3 with the same input, new `complimentId`s), and "Start Over" (back to `/form`, using the standard route transition).

---

## 9. Error Handling

| Failure | Behavior |
|---|---|
| Generation call fails (network, API error, malformed/empty JSON) | Skeleton loader is replaced with an inline error card: plain-language message ("We couldn't reach the compliment engine — mind trying again?"), a **Retry** button that re-fires the same request, and the form inputs are preserved so nothing is lost. Route/app shell stays fully intact — never a blank page. |
| Generation returns fewer than 3 valid items (schema partial failure) | Save what's valid, mark set `status: "partial"`, render the valid card(s) plus a small inline notice + retry affordance for the missing slot(s) rather than discarding everything. |
| Escalation call fails | The existing compliment/thread is untouched (never overwritten optimistically before success). Button reverts from "Escalating…" to "Escalate," and a small inline toast near that card reads "That escalation didn't land — try again?" Other two cards are unaffected. |
| Copy fails | See §8 fallback (selected text + manual copy instructions). |
| MongoDB write fails (history save or analytics) | Non-blocking. User-facing generation/escalation still succeeds and renders; failure is logged client-side/console (and optionally queued for retry) but never surfaces as a user-facing error, since it doesn't affect what the user sees or can do. |
| Route transition data fetch fails (e.g. `/results/[setId]` doesn't exist) | Curtain still opens (never gets stuck closed) revealing a themed empty/error state on the destination page with a way back (`/form` or `/`). |
| Client-side JS error in a card (React error boundary) | Boundary scoped per-card, not page-wide — one broken card shows a small "Something went wrong displaying this one" state; the other two and the rest of the page remain usable. |

General principle: **loading and error states are always additive/replacing a specific region, never blanking the whole app** — the curtain/loader disappears in favor of content or a clear error affordance, never leaves the user staring at nothing.

---

## 10. API Routes (Next.js Route Handlers)

| Route | Method | Purpose |
|---|---|---|
| `/api/compliments/generate` | POST | Body: form input. Calls Gemini (§6.3), writes `complimentSets` doc, logs analytics, returns the set (with `setId`, `complimentId`s). |
| `/api/compliments/[setId]/escalate` | POST | Body: `{ complimentId }`. Loads that thread from Mongo, builds multi-turn request (§6.4), appends new level, updates Mongo, logs analytics, returns the new thread entry. |
| `/api/compliments/[setId]` | GET | Fetch a set for `/results/[setId]` (also used to check "destination data ready" for the route-transition readiness signal). |
| `/api/history` | GET | Query by `sessionId` cookie, return recent `complimentSets` (paginated) for `/history`. |
| `/api/analytics/event` | POST | Fire-and-forget event logging (§5), never awaited by UI-blocking code. |

---

## 11. Folder Structure (indicative)

```
app/
  layout.tsx                 # root layout incl. <TransitionLayer />
  page.tsx                   # landing
  form/page.tsx
  results/[setId]/page.tsx
  history/page.tsx
  api/
    compliments/
      generate/route.ts
      [setId]/route.ts
      [setId]/escalate/route.ts
    history/route.ts
    analytics/event/route.ts
components/
  transitions/TransitionLayer.tsx
  transitions/usePageReadiness.ts
  compliments/ComplimentCard.tsx
  compliments/GenerationLoader.tsx
  compliments/EscalationHistory.tsx
  form/ComplimentForm.tsx
lib/
  gemini/client.ts
  gemini/prompts.ts          # angle definitions, system instruction, escalation copy
  db/mongodb.ts
  db/complimentSets.ts
  db/analytics.ts
  session.ts                 # anonymous sessionId cookie helpers
```

---

## 12. Environment Variables

```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
MONGODB_URI=
MONGODB_DB_NAME=compliment_generator
```

---

## 13. Open Items for Build Phase
- rate limiting will be 2 sessions then a cool down
- No deletion of history
- Guard against profanity and prompt injection attacks with system prompt for gemini as well as others