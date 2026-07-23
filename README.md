# Niche Forge

An AI-powered workspace for finding profitable niches and turning them into
sellable digital products — end to end:

1. **Niche Research** — broad interest → 6 specific, profitable sub-niches
2. **Product Validation** — demand / competition / profit scoring
3. **Customer Pain Points** — the specific struggles worth building around
4. **Product Generator** — 10 sellable ideas (ebook, course, template, planner, checklist)
5. **Outline Generator** — full 20–30 page outline for one product
6. **Sales Page Generator** — persuasive sales copy
7. **Marketing Content** — social posts, launch emails, ad copy
8. **Export to PDF** — everything you generated, compiled into one document

Built with Next.js 14 (App Router) + TypeScript + Tailwind. AI generation calls
**Groq** first (fast, generous free tier) and automatically falls back to
**Gemini** if Groq fails or isn't configured. No database — everything lives
in your browser session; export to PDF to keep it.

---

## 1. Get your API keys (both free)

- **Groq**: https://console.groq.com/keys → "Create API Key"
- **Gemini**: https://aistudio.google.com/app/apikey → "Create API key"

You only strictly need one of the two, but having both means the app keeps
working if one provider is down or rate-limited.

## 2. Run it locally

npm install, then copy .env.example to .env.local and paste in your keys, then npm run dev.
Open http://localhost:3000.

## 3. Push it to GitHub

Create a repo, then git init, git add ., git commit, git remote add origin, git push.

## 4. Deploy to Vercel

Go to vercel.com/new, import the niche-forge repo, add GROQ_API_KEY and
GEMINI_API_KEY under Environment Variables, click Deploy.

## 5. Updating after deploy

Any push to main triggers an automatic redeploy on Vercel.

---

## Project structure

app/page.tsx - main workspace UI
app/layout.tsx - fonts + metadata
app/globals.css - design tokens / typography
app/api/generate/route.ts - single API route, dispatches by "task"
lib/ai.ts - Groq call + Gemini fallback
lib/prompts.ts - prompt templates for each tool
lib/pdf.ts - client-side PDF export (jsPDF)
components/ResultView.tsx - renders AI markdown output

## Notes & next steps

This ships as a stateless single-session tool. Rate limits apply on both
free tiers. Swap models by editing GROQ_MODEL / GEMINI_MODEL in lib/ai.ts.
