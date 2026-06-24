# Tailfit — ATS CV Optimizer

Upload your CV and a job link; get back a job-match score (0–100), an
ATS-friendliness score, a rewritten ATS-friendly CV (PDF), a tailored cover
letter (PDF), and a report of exactly what changed.

Nothing is stored — files are processed in memory during a single request.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **AI SDK v6** via **Vercel AI Gateway** (Claude) — structured output with Zod
- **unpdf** / **mammoth** — CV text extraction (PDF / .docx)
- **@mozilla/readability** + **linkedom** — job-posting text extraction
- **@react-pdf/renderer** — selectable-text, single-column ATS-safe PDFs

## Setup

```bash
cp .env.local.example .env.local   # then add AI_GATEWAY_API_KEY
npm run dev
```

Open http://localhost:3000.

## How it works

1. Extract text from the uploaded CV (`lib/extract`).
2. Resolve the job description — fetch the URL (`lib/job/fetch-job.ts`) or use
   pasted text (LinkedIn etc. are often bot-blocked, so paste is the fallback).
3. Score the original CV: job-match + ATS (`lib/ai/analyze.ts`).
4. Rewrite the CV, tailored and ATS-safe, staying truthful (`lib/ai/rewrite.ts`).
5. Generate a cover letter (`lib/ai/cover-letter.ts`) and re-score the new CV.
6. Render CV / cover-letter PDFs on demand (`app/api/pdf/*`).

The orchestration lives in `app/api/analyze/route.ts`.

## Notes

- The rewrite is constrained to never invent employers, dates, titles or
  qualifications — it reframes and surfaces real experience.
- Generated PDFs use real selectable text (no images), which is what ATS
  parsers require.
